import { useState, useRef, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const BASE_URL = import.meta.env.VITE_API_URL
const OL       = "https://openlibrary.org"
const ADMIN    = { username: "admin", password: "Admin@123456" }
const SEED_PASSWORD = "tinhne-2026"

const CAT_SUBJECTS = [
  { name: "Lập trình & Công nghệ",    slug: "computer_science",       limit: 12 },
  { name: "Kinh doanh & Khởi nghiệp", slug: "business_and_economics", limit: 10 },
  { name: "Tâm lý học",               slug: "psychology",              limit: 8  },
  { name: "Phát triển bản thân",      slug: "self-help",               limit: 8  },
  { name: "Văn học kinh điển",        slug: "classic_literature",      limit: 8  },
  { name: "Khoa học",                 slug: "science",                 limit: 8  },
  { name: "Lịch sử & Địa lý",        slug: "history",                 limit: 8  },
  { name: "Triết học",               slug: "philosophy",              limit: 6  },
]

const USERS = [
  { username: "reader_minh01",    email: "minh.nguyen01@gmail.com",      password: "Minh@2024!" },
  { username: "bookworm_linh",    email: "linh.tran99@yahoo.com",        password: "Linh@2024!" },
  { username: "techreader_hung",  email: "hung.pham.dev@gmail.com",      password: "Hung@2024!" },
  { username: "story_lover_mai",  email: "mai.le.books@gmail.com",       password: "Mai@2024!"  },
  { username: "page_turner_tuan", email: "tuan.vo.reader@gmail.com",     password: "Tuan@2024!" },
  { username: "avid_huong",       email: "huong.dao.lit@gmail.com",      password: "Huong@2024!"},
  { username: "lit_fan_bao",      email: "bao.nguyen.fn@hotmail.com",    password: "Bao@2024!"  },
  { username: "night_reader_lan", email: "lan.pham.night@gmail.com",     password: "Lan@2024!"  },
  { username: "booknerd_duc",     email: "duc.tran.nerd@gmail.com",      password: "Duc@2024!"  },
  { username: "novel_seeker_thu", email: "thu.hoang.novel@gmail.com",    password: "Thu@2024!"  },
  { username: "sci_reader_an",    email: "an.le.science@gmail.com",      password: "An@2024!"   },
  { username: "history_buff_nam", email: "nam.vu.history@gmail.com",     password: "Nam@2024!"  },
  { username: "philo_seeker_uyen",email: "uyen.do.philo@gmail.com",      password: "Uyen@2024!" },
  { username: "biz_reader_khoa",  email: "khoa.ngo.biz@gmail.com",       password: "Khoa@2024!" },
  { username: "psych_fan_hoa",    email: "hoa.thi.psych@gmail.com",      password: "Hoa@2024!"  },
  { username: "dev_reader_long",  email: "long.phan.dev@gmail.com",      password: "Long@2024!" },
  { username: "classic_fan_nga",  email: "nga.dang.classic@gmail.com",   password: "Nga@2024!"  },
  { username: "selhelp_vy",       email: "vy.nguyen.grow@gmail.com",     password: "Vy@2024!"   },
  { username: "curious_cuong",    email: "cuong.tran.curious@gmail.com", password: "Cuong@2024!"},
  { username: "deep_reader_hien", email: "hien.le.deep@gmail.com",       password: "Hien@2024!" },
]

const REVIEW_TMPL = {
  "Lập trình & Công nghệ": [
    ["Cuốn sách này thay đổi cách tôi viết code hoàn toàn. Sau khi đọc xong tôi refactor lại toàn bộ dự án và nhận ra mình đã mắc rất nhiều lỗi cơ bản trong nhiều năm qua. Highly recommend!", 5],
    ["Nội dung rất thực tế, ví dụ cụ thể và dễ áp dụng ngay vào công việc hàng ngày. Tuy nhiên một số chương hơi dài dòng, nên đọc chọn lọc.", 4],
    ["Đọc lần đầu không thấm lắm, đọc lại lần 2 sau 6 tháng đi làm mới thấy đúng từng chữ. Sách viết rất thực tế, không lý thuyết suông.", 5],
    ["Tốt cho beginners và intermediate. Nếu bạn đã nhiều kinh nghiệm thì phần lớn sẽ biết rồi, nhưng đọc lại vẫn có ích để củng cố tư duy.", 3],
    ["Mình mua theo lời khuyên của senior trong team và không hối hận chút nào. Đây là sách bắt buộc phải đọc nếu bạn nghiêm túc với nghề.", 5],
    ["Concept hay nhưng ví dụ trong sách hơi cũ. Nguyên tắc vẫn đúng và áp dụng được cho mọi ngôn ngữ lập trình hiện đại.", 4],
  ],
  "Kinh doanh & Khởi nghiệp": [
    ["Thực sự mở mắt cho tôi về cách nhìn nhận startup và đổi mới sáng tạo. Lập luận rất sắc sảo, luôn kích thích suy nghĩ.", 5],
    ["Sách ngắn nhưng đầy insight. Tôi đọc 2 lần và ghi chú rất nhiều. Quan điểm về monopoly và competition rất thú vị.", 5],
    ["Hay nhưng hơi thiên về quan điểm cá nhân của tác giả. Một số luận điểm khó áp dụng cho thị trường Việt Nam.", 4],
    ["Phương pháp được trình bày rất hệ thống. Team mình đã áp dụng và thực sự tiết kiệm được nhiều thời gian.", 5],
    ["Khái niệm cốt lõi nghe đơn giản nhưng thực sự thay đổi tư duy. Phù hợp nhất cho các founders và product managers.", 4],
  ],
  "Tâm lý học": [
    ["Một trong những cuốn sách khoa học thú vị nhất mình từng đọc. Giải thích rõ tại sao chúng ta hay đưa ra quyết định sai.", 5],
    ["Sách khá dày và đôi khi hơi học thuật, nhưng mỗi chương đều có những ví dụ thực tế rất thú vị.", 4],
    ["Đọc xong mình hiểu tại sao mình hay bị dụ mua đồ không cần thiết. Sách rất thực dụng.", 5],
    ["Nghiên cứu rất vững chắc, dẫn chứng thuyết phục. Nếu đọc hết thì bạn sẽ hiểu con người sâu sắc hơn nhiều.", 4],
  ],
  "Phát triển bản thân": [
    ["Sau 3 tháng áp dụng, tôi đã xây dựng được thói quen tập gym và đọc sách mỗi ngày. Framework 1% improvement thực sự powerful.", 5],
    ["Nội dung hay và dễ đọc. Được trình bày rất hệ thống và có nền tảng khoa học. Phần về identity-based habits là insight lớn nhất.", 5],
    ["Khá giống sách self-help thông thường nhưng có nền tảng khoa học hơn. Dễ hiểu và có thể áp dụng ngay.", 4],
    ["Hơi khô ở một số chương nhưng core message về proactivity và win-win thinking vẫn rất đúng.", 3],
  ],
  "Văn học kinh điển": [
    ["Một kiệt tác thực sự. Từng câu chữ như thơ, từng trang sách là một bức tranh sống động.", 5],
    ["Khó đọc hơn tôi nghĩ vì văn phong cổ điển khá cầu kỳ. Nhưng khi hiểu được mạch truyện thì cực kỳ cuốn hút.", 4],
    ["Làm mình khóc mấy lần. Câu chuyện về công lý và lòng dũng cảm vẫn còn nguyên giá trị đến hôm nay.", 5],
    ["Lần đầu đọc không hiểu hết. Lần 2 mới thấy tầng tầng lớp lớp ý nghĩa ẩn sâu. Đây là văn học đích thực.", 5],
  ],
  "Khoa học": [
    ["Đọc xong mình hiểu hơn về vũ trụ và cảm thấy bản thân thật nhỏ bé nhưng cũng rất thú vị.", 5],
    ["Sách khoa học dễ đọc hiếm có. Tuy nhiên một số phần vẫn khiến mình phải đọc lại nhiều lần.", 4],
    ["Xuất sắc trong việc làm cho khoa học trở nên accessible. Sau khi đọc tôi bắt đầu tìm hiểu thêm về lĩnh vực này.", 5],
  ],
  "Lịch sử & Địa lý": [
    ["Cực kỳ kích thích tư duy. Tác giả dám đặt những câu hỏi táo bạo về lịch sử nhân loại.", 5],
    ["Nội dung phong phú và góc nhìn mới lạ. Không khô khan như sách lịch sử thông thường.", 4],
    ["Đọc 2 lần vẫn thấy hay. Mỗi lần đọc lại phát hiện ra thêm nhiều insight mới. Bắt buộc phải có trong tủ sách.", 5],
  ],
  "Triết học": [
    ["Triết học Stoic thực sự giúp mình bình tĩnh hơn khi đối mặt với áp lực. Mình đọc mỗi sáng để bắt đầu ngày mới.", 5],
    ["Không phải viết để xuất bản nên cách viết khá lặp lại. Nhưng sự chân thực đó chính là điểm mạnh nhất.", 4],
    ["Triết học phương Tây cổ đại nhưng vẫn cực kỳ relevant với cuộc sống hiện đại.", 5],
    ["Cần kiên nhẫn để đọc vì văn phong khá khó. Nhưng nếu đọc hết, bạn sẽ có nền tảng triết học vững chắc.", 4],
  ],
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ─── API helper ─────────────────────────────────────────────────────────────
async function callApi(path, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  let data
  try { data = await res.json() } catch { data = {} }
  if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`)
  return data
}

// ─── Crawl Open Library ──────────────────────────────────────────────────────
async function crawlSubject(slug, limit) {
  try {
    const res = await fetch(`${OL}/subjects/${slug}.json?limit=${limit}`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.works || []).filter(w => w.cover_id)
  } catch {
    return []
  }
}

function makeCoverUrl(coverId) {
  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
}

function extractISBN(work) {
  if (work.availability?.isbn) return work.availability.isbn
  const seed = (work.key?.replace(/\D/g, "") || Math.random().toString().slice(2, 12))
  return "978" + seed.slice(0, 10).padEnd(10, "0")
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function SeederPage() {
  const navigate = useNavigate()

  // Fix: useState trước mọi thứ — không gọi hooks có điều kiện
  const [authed,   setAuthed]   = useState(false)
  const [pwInput,  setPwInput]  = useState("")
  const [pwError,  setPwError]  = useState("")
  const [logs,     setLogs]     = useState([])
  const [running,  setRunning]  = useState(false)
  const [phase,    setPhase]    = useState("")
  const [stats,    setStats]    = useState({ cats: 0, books: 0, users: 0, reviews: 0, likes: 0 })
  const [prog,     setProg]     = useState(0)
  const [progMax,  setProgMax]  = useState(100)

  const abortRef  = useRef(false)
  const logsEndRef = useRef(null)

  useEffect(() => {
    document.title = "Seeder — BookReview Admin"
  }, [])

  // Auto scroll log
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  const addLog = useCallback((msg, type = "info") => {
    setLogs(prev => {
      const next = [...prev, { msg, type, time: new Date().toLocaleTimeString() }]
      return next.slice(-300) // giữ tối đa 300 dòng log
    })
  }, [])

  // ── Password gate ────────────────────────────────────────────────────────
  const handleAuth = () => {
    if (pwInput === SEED_PASSWORD) {
      setAuthed(true)
    } else {
      setPwError("Sai mật khẩu")
      setPwInput("")
    }
  }

  if (!authed) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "60vh", gap: 12,
      }}>
        <p style={{ fontWeight: 500, fontSize: 15, color: "var(--color-text-primary)" }}>
          🌱 Seeder — Nhập mật khẩu để tiếp tục
        </p>
        <input
          type="password"
          value={pwInput}
          onChange={e => { setPwInput(e.target.value); setPwError("") }}
          onKeyDown={e => e.key === "Enter" && handleAuth()}
          placeholder="Seed password"
          autoFocus
          style={{
            padding: "8px 14px", fontSize: 14, borderRadius: 8,
            border: `1px solid ${pwError ? "var(--color-border-danger)" : "var(--color-border-secondary)"}`,
            outline: "none", width: 220,
          }}
        />
        {pwError && (
          <p style={{ color: "var(--color-text-danger)", fontSize: 13, margin: 0 }}>
            {pwError}
          </p>
        )}
        <button onClick={handleAuth} style={{ padding: "8px 24px", fontSize: 14 }}>
          Xác nhận
        </button>
        <button
          onClick={() => navigate("/")}
          style={{ fontSize: 13, color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer" }}
        >
          Quay lại trang chủ
        </button>
      </div>
    )
  }

  // ── Main seed flow ────────────────────────────────────────────────────────
  async function runSeed() {
    setRunning(true)
    setLogs([])
    abortRef.current = false
    setStats({ cats: 0, books: 0, users: 0, reviews: 0, likes: 0 })
    setProg(0)

    try {
      // Step 0: Admin login
      setPhase("🔑 Admin login")
      addLog("Đăng nhập Admin...")
      const adminData  = await callApi("/api/auth/login", "POST", ADMIN)

      // Fix: backend trả accessToken không phải token
      const adminToken = adminData.accessToken || adminData.token
      if (!adminToken) throw new Error("Không lấy được admin token — kiểm tra lại credentials")
      addLog("✅ Admin token OK", "success")

      // Step 1: Categories
      setPhase("📂 Categories")
      addLog("─── TẠO CATEGORIES ───")

      const existCatsRaw = await callApi("/api/categories")

      // Fix: đảm bảo existCats là array dù backend trả List hay Page
      const existCats = Array.isArray(existCatsRaw)
        ? existCatsRaw
        : (existCatsRaw?.content ?? [])

      const catMap = {}
      existCats.forEach(c => { catMap[c.name] = c.id })

      for (const { name } of CAT_SUBJECTS) {
        if (abortRef.current) break
        if (catMap[name]) {
          addLog(`  ↩️ "${name}" đã tồn tại`, "warn")
          continue
        }
        try {
          const c = await callApi("/api/categories", "POST", { name }, adminToken)
          catMap[name] = c.id
          setStats(s => ({ ...s, cats: s.cats + 1 }))
          addLog(`  ✅ ${name}`, "success")
        } catch (e) {
          addLog(`  ❌ ${name}: ${e.message}`, "error")
        }
        await delay(200)
      }

      // Step 2: Crawl + seed books
      setPhase("📚 Crawl sách từ Open Library")
      addLog("─── CRAWL SÁCH TỪ OPEN LIBRARY ───")

      const existBooksResp = await callApi("/api/books?size=50")
      const existTitles = new Set(
        (existBooksResp.content || []).map(b => b.title.toLowerCase().trim())
      )

      const totalTarget = CAT_SUBJECTS.reduce((s, c) => s + c.limit, 0)
      setProgMax(totalTarget + USERS.length + totalTarget * 4 + 30)

      for (const { name, slug, limit } of CAT_SUBJECTS) {
        if (abortRef.current) break
        const catId = catMap[name]
        if (!catId) {
          addLog(`  ⚠️ Không có catId cho "${name}"`, "warn")
          continue
        }

        addLog(`  🌐 Crawling "${name}" (${slug})...`)
        const works = await crawlSubject(slug, limit + 5)
        addLog(`  → Tìm thấy ${works.length} works có cover`)

        let added = 0
        for (const w of works) {
          if (abortRef.current || added >= limit) break

          const title = w.title?.trim()
          if (!title || existTitles.has(title.toLowerCase())) {
            addLog(`    ↩️ "${title?.substring(0, 40)}" đã tồn tại`, "warn")
            setProg(p => p + 1)
            continue
          }

          const author   = (w.authors || []).map(a => a.name).join(", ") || "Unknown Author"
          const coverUrl = makeCoverUrl(w.cover_id)
          const isbn     = extractISBN(w)
          const description = `${title} là một trong những tác phẩm nổi bật trong thể loại ${name}. Tác phẩm của ${author} đã để lại dấu ấn sâu sắc với cách trình bày độc đáo và nội dung phong phú.`

          try {
            await callApi("/api/books", "POST", {
              title, author, isbn, description, coverUrl, categoryId: catId,
            }, adminToken)
            existTitles.add(title.toLowerCase())
            setStats(s => ({ ...s, books: s.books + 1 }))
            addLog(`    ✅ "${title.substring(0, 50)}" — ${author.substring(0, 30)}`, "success")
            added++
          } catch (e) {
            addLog(`    ❌ "${title?.substring(0, 40)}": ${e.message}`, "error")
          }

          setProg(p => p + 1)
          await delay(250) // tránh rate limit
        }
      }

      // Step 3: Users
      setPhase("👥 Tạo Users")
      addLog("─── TẠO USERS ───")
      const userTokens = []

      for (const u of USERS) {
        if (abortRef.current) break

        // Đăng ký — bỏ qua nếu đã tồn tại
        try {
          await callApi("/api/auth/register", "POST", u)
          setStats(s => ({ ...s, users: s.users + 1 }))
          addLog(`  ✅ Đăng ký: ${u.username}`, "success")
        } catch {
          addLog(`  ↩️ ${u.username} đã tồn tại`, "warn")
        }

        // Login để lấy token
        try {
          const loginData = await callApi("/api/auth/login", "POST", {
            username: u.username,
            password: u.password,
          })
          // Fix: lấy accessToken
          const token = loginData.accessToken || loginData.token
          if (token) userTokens.push({ username: u.username, token })
        } catch (e) {
          addLog(`  ❌ Login ${u.username}: ${e.message}`, "error")
        }

        setProg(p => p + 1)
        await delay(150)
      }

      addLog(`  → ${userTokens.length}/${USERS.length} users có token`, "info")

      // Step 4: Reviews
      setPhase("✍️ Tạo Reviews")
      addLog("─── TẠO REVIEWS ───")

      const allBooksResp = await callApi("/api/books?size=50")
      const allBooks = allBooksResp.content || []

      // Fix: backend trả categoryName string, không có categoryId
      // Map tên category → id từ catMap đã build ở step 1
      const catNameToId = Object.fromEntries(
        Object.entries(catMap).map(([name, id]) => [name, id])
      )

      // Build map bookId → categoryName từ response
      // Book response có field categoryName (string)
      const reviewedPairs = new Set()

      for (const book of allBooks) {
        if (abortRef.current) break

        // Dùng categoryName từ book response để map vào REVIEW_TMPL
        const catName = book.categoryName || "Lập trình & Công nghệ"
        const pool = REVIEW_TMPL[catName] || REVIEW_TMPL["Lập trình & Công nghệ"]

        // Chọn 3–5 users ngẫu nhiên để review
        const shuffled = [...userTokens].sort(() => Math.random() - 0.5)
        const count    = 3 + Math.floor(Math.random() * 3)
        const reviewers = shuffled.slice(0, Math.min(count, shuffled.length))

        for (const { username, token } of reviewers) {
          if (abortRef.current) break

          const pairKey = `${username}::${book.id}`
          if (reviewedPairs.has(pairKey)) continue
          reviewedPairs.add(pairKey)

          const [content, rating] = pool[Math.floor(Math.random() * pool.length)]

          try {
            await callApi("/api/reviews", "POST", {
              bookId: book.id,
              content,
              rating,
            }, token)
            setStats(s => ({ ...s, reviews: s.reviews + 1 }))
            addLog(`  ✅ ${username} → "${book.title.substring(0, 35)}..." [${rating}★]`, "success")
          } catch (e) {
            if (!e.message.includes("already") && !e.message.includes("đã review")) {
              addLog(`  ❌ review: ${e.message}`, "error")
            } else {
              addLog(`  ↩️ ${username} đã review rồi`, "warn")
            }
          }

          setProg(p => p + 1)
          await delay(250)
        }
      }

      // Step 5: Likes
      setPhase("❤️ Tạo Likes")
      addLog("─── TẠO LIKES ───")

      for (const book of allBooks.slice(0, 25)) {
        if (abortRef.current) break

        try {
          const rvResp = await callApi(`/api/reviews/book/${book.id}?size=10`)
          const reviews = rvResp.content || []

          for (const rv of reviews.slice(0, 3)) {
            // Chọn likers ngẫu nhiên, không bao gồm chính reviewer
            const likers = userTokens
              .filter(u => u.username !== rv.username)
              .sort(() => Math.random() - 0.5)
              .slice(0, 2 + Math.floor(Math.random() * 3))

            for (const { token } of likers) {
              if (abortRef.current) break
              try {
                await callApi(`/api/reviews/${rv.id}/like`, "POST", null, token)
                setStats(s => ({ ...s, likes: s.likes + 1 }))
              } catch {
                // Like đã tồn tại → bỏ qua
              }
              await delay(100)
            }
          }
        } catch {
          // Sách không có reviews → bỏ qua
        }

        setProg(p => p + 1)
      }

      addLog("", "info")
      addLog("🎉 ══════════════════════════════════════", "success")
      addLog("   SEED HOÀN TẤT — hệ thống đã có data thật!", "success")
      addLog("🎉 ══════════════════════════════════════", "success")
      setPhase("✅ Hoàn tất")

    } catch (e) {
      addLog(`💥 Lỗi nghiêm trọng: ${e.message}`, "error")
      setPhase("❌ Lỗi")
    }

    setRunning(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const typeColor = {
    info:    "var(--color-text-secondary)",
    success: "var(--color-text-success)",
    error:   "var(--color-text-danger)",
    warn:    "#92400e",
  }

  const pct = progMax > 0 ? Math.min(100, Math.round((prog / progMax) * 100)) : 0

  return (
    <div style={{ padding: "1rem 0", fontFamily: "var(--font-sans)" }}>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 4px", color: "var(--color-text-primary)" }}>
        BookReview — Real Data Seeder
      </h2>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 13, margin: "0 0 1rem" }}>
        Crawl trực tiếp từ <strong style={{ fontWeight: 500 }}>Open Library API</strong>
        {" "}· 60+ sách thật · 20 users · reviews & likes
      </p>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: "1rem" }}>
        {[
          ["📂", "Categories", stats.cats,    CAT_SUBJECTS.length],
          ["📚", "Books",      stats.books,   "60+"],
          ["👥", "Users",      stats.users,   USERS.length],
          ["✍️", "Reviews",    stats.reviews, "~200"],
          ["❤️", "Likes",      stats.likes,   "~150"],
        ].map(([ic, lb, v, t]) => (
          <div key={lb} style={{
            background: "var(--color-background-secondary)",
            borderRadius: "var(--border-radius-md)",
            padding: "10px",
          }}>
            <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 2px" }}>
              {ic} {lb}
            </p>
            <p style={{ fontSize: 18, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>
              {v}
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 400 }}>
                /{t}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {(running || prog > 0) && (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>
            <span style={{ fontStyle: "italic" }}>{phase}</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 5, background: "var(--color-background-secondary)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: "var(--color-text-info)",
              borderRadius: 99,
              transition: "width .4s ease",
            }} />
          </div>
        </div>
      )}

      {/* Source info */}
      <div style={{
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-md)",
        padding: "10px 14px", marginBottom: "1rem",
        fontSize: 12, color: "var(--color-text-secondary)",
      }}>
        <strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Nguồn data:</strong>
        {" "}openlibrary.org/subjects/[slug].json — ảnh bìa thật từ covers.openlibrary.org
        <br />Subjects: {CAT_SUBJECTS.map(c => c.slug).join(", ")}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap" }}>
        <button
          onClick={runSeed}
          disabled={running}
          style={{ padding: "8px 22px", fontSize: 14 }}
        >
          {running ? "⏳ Đang crawl & seed..." : "▶ Bắt đầu Seed"}
        </button>

        {running && (
          <button
            onClick={() => { abortRef.current = true }}
            style={{ padding: "8px 14px", fontSize: 14, color: "var(--color-text-danger)" }}
          >
            ■ Dừng
          </button>
        )}

        <button
          onClick={() => {
            setLogs([])
            setProg(0)
            setStats({ cats: 0, books: 0, users: 0, reviews: 0, likes: 0 })
          }}
          disabled={running}
          style={{ padding: "8px 14px", fontSize: 14 }}
        >
          Xóa log
        </button>

        <button
          onClick={() => navigate("/")}
          style={{ padding: "8px 14px", fontSize: 14, marginLeft: "auto" }}
        >
          ← Trang chủ
        </button>
      </div>

      {/* Log panel */}
      <div style={{
        background: "var(--color-background-secondary)",
        borderRadius: "var(--border-radius-md)",
        border: "0.5px solid var(--color-border-tertiary)",
        padding: "10px 14px",
        height: 380, overflowY: "auto",
        fontFamily: "var(--font-mono)", fontSize: 11.5,
      }}>
        {logs.length === 0 && (
          <p style={{ color: "var(--color-text-tertiary)", margin: 0 }}>
            Log sẽ hiển thị ở đây khi bắt đầu chạy...
          </p>
        )}
        {logs.map((l, i) => (
          <div key={i} style={{
            display: "flex", gap: 10, marginBottom: 1.5,
            color: typeColor[l.type] || typeColor.info,
          }}>
            <span style={{ color: "var(--color-text-tertiary)", minWidth: 64, flexShrink: 0 }}>
              {l.time}
            </span>
            <span style={{ wordBreak: "break-word" }}>{l.msg}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: "0.75rem", marginBottom: 0 }}>
        ⚠️ Idempotent — dữ liệu đã tồn tại sẽ bị bỏ qua. Chạy nhiều lần an toàn.
        Server Render free tier cần 30–60s cold start lần đầu.
      </p>
    </div>
  )
}