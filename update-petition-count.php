<?php
$petitionId = '767417';
$sourceUrl = "https://petition.parliament.uk/petitions/$petitionId.json";
$outputFile = __DIR__ . '/petition-count.json';

$json = @file_get_contents($sourceUrl);

if ($json === false) {
    exit("Failed to fetch petition JSON\n");
}

$data = json_decode($json, true);

if (!is_array($data) || !isset($data['data']['attributes']['signature_count'])) {
    exit("Invalid JSON structure\n");
}

$out = [
    'signature_count' => (int)$data['data']['attributes']['signature_count']
];

file_put_contents($outputFile, json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));