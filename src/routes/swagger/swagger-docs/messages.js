/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: API Endpoint untuk pengiriman pesan
 */

/**
 * @swagger
 * /messages/send:
 *   post:
 *     summary: Mengirim pesan teks atau media
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sender
 *               - receiver
 *               - message
 *             properties:
 *               sender:
 *                 type: string
 *                 example: "session_id_1"
 *                 description: "ID sesi pengirim"
 *               receiver:
 *                 type: string
 *                 example: "6285123456789"
 *                 description: "Nomor penerima dengan kode negara"
 *               message:
 *                 type: string
 *                 example: "Hello World!"
 *                 description: "Isi pesan atau caption untuk media"
 *               file:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *                 description: "URL publik file media (opsional)"
 *               viewOnce:
 *                 type: boolean
 *                 example: false
 *                 description: "Pesan sekali lihat (opsional, default: false)"
 *     responses:
 *       200:
 *         description: Pesan berhasil dikirim
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Message sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sender:
 *                       type: string
 *                       example: "session_id_1"
 *                     receiver:
 *                       type: string
 *                       example: "6285123456789@s.whatsapp.net"
 *                     message:
 *                       type: string
 *                       example: "Hello World!"
 *                     file:
 *                       type: string
 *                       example: "https://example.com/image.jpg"
 *                       nullable: true
 *                     viewOnce:
 *                       type: boolean
 *                       example: false
 *                     messageId:
 *                       type: string
 *                       example: "ABCD1234"
 *                       nullable: true
 */
