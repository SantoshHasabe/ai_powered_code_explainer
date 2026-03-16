<?php

 if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['code'])) {
    header('Content-Type: application/json');

    $api_key = 'gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Add GROQ KEY HERE

    $model   = 'llama-3.3-70b-versatile';  // use 'llama-3.1-8b-instant' if you hit limits

    $lang = $_POST['lang'] ?? 'JavaScript';
    $code = $_POST['code'] ?? '';

    if (empty($api_key) || strpos($api_key, 'gsk_') !== 0) {
        echo json_encode(['success' => false, 'error' => 'Missing or invalid Groq API key']);
        exit;
    }

    $system_prompt = "You are an expert code explainer. 
        Analyze the provided {$lang} code snippet accurately. 
        Never hallucinate functionality that is not present in the code. 
        Respond ONLY with a valid JSON object using this exact structure (no extra text, no markdown):
        {
        \"explanation\": \"2-4 sentence plain English explanation\",
        \"complexity\": \"Time complexity: O(...) | Space complexity: O(...) (or N/A if not applicable)\",
        \"optimized\": \"full optimized code here OR the exact string 'No optimization needed'\"
        }
        Be extremely concise and precise.";

    $user_prompt = "Language: {$lang}\n\nCode:\n```{$lang}\n{$code}\n```";

    $payload = [
        'model' => $model,
        'messages' => [
            ['role' => 'system', 'content' => $system_prompt],
            ['role' => 'user',   'content' => $user_prompt]
        ],
        'temperature' => 0.1,
        'max_tokens' => 800
    ];

    $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $api_key
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

    $raw = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code !== 200) {
        $msg = match($http_code) {
            429 => 'Rate limit reached (free tier) - try again in a minute or use smaller model',
            401 => 'Invalid Groq key',
            default => 'API error ' . $http_code
        };
        echo json_encode(['success' => false, 'error' => $msg]);
        exit;
    }


    $response = json_decode($raw, true);

    if (!isset($response['choices'][0]['message']['content'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid API response']);
        exit;
    }

    $content = $response['choices'][0]['message']['content'];
    $parsed = json_decode($content, true);

    if (!$parsed || !isset($parsed['explanation'])) {
        echo json_encode([
            'success' => true,
            'explanation' => $content,
            'complexity' => 'N/A (JSON parse failed)',
            'optimized' => 'No optimization needed'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'explanation' => $parsed['explanation'] ?? 'No explanation returned.',
        'complexity'  => $parsed['complexity'] ?? 'N/A',
        'optimized'   => $parsed['optimized'] ?? 'No optimization needed'
    ]);
    exit;
}

require_once('./index.html');