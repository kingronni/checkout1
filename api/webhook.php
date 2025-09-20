<?php
// Webhook para receber confirmações de pagamento da PushinPay
header('Content-Type: application/json');

// Log da requisição para debug
$logFile = 'pushinpay_webhook.log';
$logData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'body' => file_get_contents('php://input')
];
file_put_contents($logFile, json_encode($logData) . "\n", FILE_APPEND);

// Verifica se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Pega o corpo da requisição
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Aqui você pode processar a confirmação do pagamento
// Exemplo de dados que podem vir da PushinPay:
// {
//   "id": "payment_id",
//   "status": "approved",
//   "value": 1998,
//   "pix_code": "...",
//   "created_at": "2024-01-01T00:00:00Z"
// }

// Log do pagamento confirmado
if (isset($data['status']) && $data['status'] === 'approved') {
    $paymentLog = [
        'timestamp' => date('Y-m-d H:i:s'),
        'payment_id' => $data['id'] ?? 'unknown',
        'value' => $data['value'] ?? 0,
        'status' => 'approved'
    ];
    file_put_contents('payments_confirmed.log', json_encode($paymentLog) . "\n", FILE_APPEND);
    
    // Aqui você pode:
    // 1. Atualizar o status do pedido no banco de dados
    // 2. Enviar email de confirmação para o cliente
    // 3. Liberar acesso ao produto/serviço
    // 4. Etc.
}

// Resposta para a PushinPay
http_response_code(200);
echo json_encode(['status' => 'received']);
?>