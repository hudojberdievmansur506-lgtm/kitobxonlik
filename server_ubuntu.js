const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// 1. CORS sozlamalari (CORS Configuration for Netlify and other clients)
app.use(cors({
  origin: '*', // Hamma manbalardan so'rovlarni qabul qilish (Netlify uchun mos)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

// Express.json middleware tana (body) o'qiy olishi uchun
app.use(express.json());

// 2. PostgreSQL Connection Pool Configuration
const pool = new Pool({
  user: 'kitob_user',
  password: '12345678',
  host: 'localhost',
  database: 'kitobxonlik',
  port: 5432,
});

// Database ulanishini tekshirish
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Databasega ulanishda xatolik yuz berdi:', err.stack);
  } else {
    console.log('✅ PostgreSQL databasega muvaffaqiyatli ulandi!');
    release();
  }
});

// Helper: Custom random string generator (Agar crypto.randomUUID qo'llab-quvvatlanmasa fallback uchun)
function generateId() {
  try {
    return crypto.randomUUID();
  } catch (err) {
    return crypto.randomBytes(16).toString('hex');
  }
}

// Router yaratamiz. Biz barcha routelarni ham '/' ham '/api' prefiqsi bilan ishlaydigan qilamiz.
const router = express.Router();

// ==========================================
// 1. GET /books (Barcha kitoblarni qaytarish)
// ==========================================
router.get('/books', async (req, res) => {
  try {
    const query = 'SELECT * FROM books ORDER BY yaratilgan_vaqt DESC';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('GET /books xatolik:', err);
    res.status(500).json({ error: 'Kitoblarni yuklashda xatolik yuz berdi', details: err.message });
  }
});

// ==========================================
// POST /books (Yangi kitob yaratish)
// ==========================================
router.post('/books', async (req, res) => {
  const { nom } = req.body;
  if (!nom || nom.trim() === '') {
    return res.status(400).json({ error: "Kitobning 'nom' maydoni bo'sh bo'lmasligi kerak!" });
  }

  try {
    const id = generateId();
    const query = 'INSERT INTO books (id, nom) VALUES ($1, $2) RETURNING *';
    const values = [id, nom.trim()];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /books xatolik:', err);
    res.status(500).json({ error: 'Kitob yaratishda xatolik yuz berdi', details: err.message });
  }
});

// ====================================================
// 2. GET /questions/:bookId (Kitobning savollarini qaytarish)
// ====================================================
router.get('/questions/:bookId', async (req, res) => {
  const { bookId } = req.params;
  try {
    const query = 'SELECT * FROM questions WHERE book_id = $1';
    const { rows } = await pool.query(query, [bookId]);
    res.json(rows);
  } catch (err) {
    console.error(`GET /questions/${bookId} xatolik:`, err);
    res.status(500).json({ error: 'Savollarni yuklashda xatolik yuz berdi', details: err.message });
  }
});

// ==========================================
// GET /questions (Barcha savollarni yuklash)
// ==========================================
router.get('/questions', async (req, res) => {
  try {
    const query = 'SELECT * FROM questions';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('GET /questions xatolik:', err);
    res.status(500).json({ error: 'Barcha savollarni yuklashda xatolik yuz berdi', details: err.message });
  }
});

// ==========================================
// POST /questions (Savol qo'shish)
// ==========================================
router.post('/questions', async (req, res) => {
  const { book_id, savol, togri_javob, variantlar } = req.body;

  if (!book_id || !savol || !togri_javob || !variantlar) {
    return res.status(400).json({ 
      error: "Noto'g'ri ma'lumotlar. book_id, savol, togri_javob va variantlar taqdim etilishi shart!" 
    });
  }

  try {
    const id = generateId();
    // variantlar massivini JSON formatiga o'tkazamiz
    const variantlarJson = Array.isArray(variantlar) ? JSON.stringify(variantlar) : variantlar;

    const query = 'INSERT INTO questions (id, book_id, savol, togri_javob, variantlar) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [id, book_id, savol, togri_javob, variantlarJson];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /questions xatolik:', err);
    res.status(500).json({ error: 'Savolni saqlashda xatolik yuz berdi', details: err.message });
  }
});

// ==========================================
// 3. POST /results (Talaba test natijasini saqlash)
// ==========================================
router.post('/results', async (req, res) => {
  const {
    familiya_ism,
    kurs,
    daraja,
    talim_yonalishi,
    jami_savollar,
    togri_javoblar,
    foiz,
    book_ids
  } = req.body;

  if (!familiya_ism || !kurs || !daraja || !talim_yonalishi || jami_savollar === undefined || togri_javoblar === undefined || foiz === undefined) {
    return res.status(400).json({ error: "Barcha kerakli natija maydonlari to'ldirilishi shart!" });
  }

  try {
    const id = generateId();
    const query = `
      INSERT INTO results (id, familiya_ism, kurs, daraja, talim_yonalishi, jami_savollar, togri_javoblar, foiz, book_ids)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      id,
      familiya_ism,
      kurs,
      daraja,
      talim_yonalishi,
      parseInt(jami_savollar),
      parseInt(togri_javoblar),
      parseFloat(foiz),
      book_ids || ''
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /results xatolik:', err);
    res.status(500).json({ error: 'Natijani saqlashda xatolik yuz berdi', details: err.message });
  }
});

// ==========================================
// 4. GET /results (Barcha natijalarni qaytarish)
// ==========================================
router.get('/results', async (req, res) => {
  try {
    const query = 'SELECT * FROM results ORDER BY vaqt DESC';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('GET /results xatolik:', err);
    res.status(500).json({ error: 'Natijalarni yuklashda xatolik yuz berdi', details: err.message });
  }
});

// ==========================================
// DELETE /results (Barcha natijalarni o'chirish / bazani tozalash)
// ==========================================
router.delete('/results', async (req, res) => {
  try {
    const query = 'DELETE FROM results';
    await pool.query(query);
    res.json({ success: true, message: 'Barcha natijalar bazadan muvaffaqiyatli tozalandi.' });
  } catch (err) {
    console.error('DELETE /results xatolik:', err);
    res.status(500).json({ error: 'Natijalarni tozalashda xatolik yuz berdi', details: err.message });
  }
});

// ========================================================
// 5. DELETE /books/:id (Kitob va unga tegishli savollarni o'chirish)
// ========================================================
router.delete('/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1-bosqich: Tegishli savollarni o'chiramiz (agar bazada Cascade o'rnatilmagan bo'lsa xavfsizlik uchun)
    await pool.query('DELETE FROM questions WHERE book_id = $1', [id]);

    // 2-bosqich: Kitobning o'zini o'chiramiz
    const query = 'DELETE FROM books WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Kitob topilmadi!' });
    }

    res.json({ success: true, message: 'Kitob va uning savollari muvaffaqiyatli o‘chirildi', o_chirilgan_kitob: rows[0] });
  } catch (err) {
    console.error(`DELETE /books/${id} xatolik:`, err);
    res.status(500).json({ error: 'Kitobni o‘chirishda xatolik yuz berdi', details: err.message });
  }
});

// Barcha routelarni ham / bilan ham /api bilan bog'laymiz
app.use('/api', router);
app.use('/', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Kutilmagan xatolik yuz berdi:", err);
  res.status(500).json({ error: 'Serverda kutilmagan ichki xatolik yuz berdi' });
});

// 3. Port ulanishi va PM2 logs xabari
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server 3001 portda ishladi`);
});
