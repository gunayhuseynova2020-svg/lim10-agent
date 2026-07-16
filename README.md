# AI Agent Starter

Telefon üçün hazırlanmış sadə şəxsi AI köməkçi.

## İlk işlətmə

1. Node.js quraşdır.
2. Bu qovluğu aç.
3. Terminalda:
   npm install
4. `.env.example` faylının surətini `.env.local` adı ilə yarat.
5. OpenAI API açarını `.env.local` faylına yaz.
6. Terminalda:
   npm run dev
7. Brauzerdə `http://localhost:3000` aç.

## Cloud-a yerləşdirmək

Ən rahat başlanğıc:
- GitHub-a yüklə
- Vercel-ə import et
- Vercel Environment Variables bölməsinə `OPENAI_API_KEY` və `OPENAI_MODEL` əlavə et
- Deploy et
- iPhone Safari-də saytı açıb “Add to Home Screen” seç

## Hazır olanlar

- Telefon üçün responsive ekran
- Azərbaycan dilində səsdən mətnə giriş
- OpenAI Responses API bağlantısı
- Son 20 tapşırığın cihazda saxlanması
- PWA manifest

## Sonrakı mərhələlər

1. Login və Supabase məlumat bazası
2. E-mail oxuma/göndərmə
3. Google Calendar
4. Telefon zəngi üçün Twilio və ya oxşar xidmət
5. Danışıq transkripti və avtomatik xülasə
6. Təsdiq sistemi: AI hər hansı real əməliyyatdan əvvəl səndən icazə alsın
