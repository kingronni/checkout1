<?php
// Define que a resposta será no formato JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- CONFIGURAÇÃO ---
// SUBSTITUA COM SEU TOKEN REAL DA PUSHINPAY
define('PUSHINPAY_API_TOKEN', '47106|rFbBj77O52Qe1yNK3kKbYS5oii9wi0qtcEbIG8zz099b7b7e'); 

// URL da sua webhook para receber confirmações de pagamento
define('YOUR_WEBHOOK_URL', 'https://privacybrasil.blog/venuswaifu/api/webhook.php'); 
// --- FIM DA CONFIGURAÇÃO ---

// Verifica se a requisição é do tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Método não permitido.']);
    exit;
}

// Pega o corpo da requisição enviada pelo JavaScript
$input = json_decode(file_get_contents('php://input'), true);

// Validação simples do valor recebido
$value_cents = filter_var($input['value'] ?? 0, FILTER_VALIDATE_INT);
if (!$value_cents || $value_cents < 50) { // Valor mínimo de 50 centavos
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Valor inválido ou abaixo do mínimo.']);
    exit;
}

// Monta o corpo (body) da requisição para a API da Pushinpay
$payload = [
    'value' => $value_cents,
    'webhook_url' => YOUR_WEBHOOK_URL // Opcional, mas altamente recomendado
];

// Configura os cabeçalhos (headers) da requisição
$headers = [
    'Authorization: Bearer ' . PUSHINPAY_API_TOKEN,
    'Accept: application/json',
    'Content-Type: application/json'
];

// Inicia a chamada cURL para a API
$ch = curl_init('https://api.pushinpay.com.br/api/pix/cashIn');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Verifica se a chamada à API foi bem-sucedida
if ($http_code >= 200 && $http_code < 300) {
    // Se sim, envia a resposta da Pushinpay diretamente para o JavaScript
    http_response_code($http_code);
    echo $response;
} else {
    // Se não, envia uma mensagem de erro
    http_response_code(502); // Bad Gateway (erro ao comunicar com a API)
    echo json_encode([
        'error' => 'O serviço de pagamentos está indisponível no momento.',
        'details' => json_decode($response) // Inclui detalhes do erro da API, se houver
    ]);
}

exit;