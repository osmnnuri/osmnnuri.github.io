-- Haber ağı için başlangıç ilgi alanları ve kaynaklar (panelden değiştirilebilir)

insert into public.interests (name, weight, keywords) values
('Siber güvenlik', 10, array[
    'siber', 'güvenlik açığı', 'zafiyet', 'security', 'cybersecurity', 'vulnerability', 'vulnerabilities',
    'cve', 'exploit', 'exploited', 'malware', 'ransomware', 'phishing', 'oltalama', 'zero-day', '0-day',
    'breach', 'veri sızıntısı', 'pentest', 'penetration', 'owasp', 'ctf', 'hacker', 'hackers', 'botnet',
    'firewall', 'backdoor', 'patch', 'siber saldırı', 'infosec', 'red team', 'blue team', 'soc'
]),
('Yapay zekâ', 9, array[
    'ai', 'yapay zeka', 'yapay zekâ', 'llm', 'llms', 'gpt', 'chatgpt', 'claude', 'gemini', 'openai',
    'anthropic', 'deepmind', 'mistral', 'llama', 'machine learning', 'makine öğrenmesi', 'deep learning',
    'derin öğrenme', 'neural', 'ai agent', 'agents', 'agentic', 'generative', 'üretken', 'hugging face',
    'transformer', 'fine-tuning', 'rag', 'copilot'
]),
('Mobil geliştirme', 9, array[
    'android', 'kotlin', 'jetpack compose', 'compose', 'flutter', 'dart', 'ios', 'swift', 'swiftui',
    'mobile', 'mobil', 'mobil uygulama', 'react native', 'play store', 'google play', 'app store',
    'android studio', 'material design', 'pwa', 'firebase', 'supabase'
]),
('İş ve staj ilanları', 8, array[
    'intern', 'internship', 'interns', 'staj', 'stajyer', 'stajı', 'junior', 'entry level', 'entry-level',
    'new grad', 'graduate', 'yeni mezun', 'hiring', 'işe alım', 'iş ilanı', 'kariyer', 'remote',
    'uzaktan', 'part-time', 'yarı zamanlı', 'mobile developer', 'android developer', 'flutter developer',
    'security engineer', 'security analyst'
]),
('Etkinlik ve fırsatlar', 7, array[
    'hackathon', 'scholarship', 'burs', 'bootcamp', 'kamp', 'conference', 'konferans', 'zirve', 'summit',
    'yarışma', 'competition', 'challenge', 'grant', 'hibe', 'fellowship', 'call for papers', 'ücretsiz eğitim',
    'free course', 'sertifika', 'certification', 'teknofest', 'student', 'öğrenci', 'üniversite'
]),
('Web geliştirme', 3, array[
    'javascript', 'typescript', 'web', 'css', 'html', 'seo', 'react', 'next.js', 'vercel', 'node.js'
]);

insert into public.news_sources (name, url, kind, lang, weight) values
-- Siber güvenlik
('The Hacker News', 'https://feeds.feedburner.com/TheHackersNews', 'haber', 'en', 2),
('BleepingComputer', 'https://www.bleepingcomputer.com/feed/', 'haber', 'en', 1),
('Krebs on Security', 'https://krebsonsecurity.com/feed/', 'haber', 'en', 1),
('CISA Uyarıları', 'https://www.cisa.gov/cybersecurity-advisories/all.xml', 'haber', 'en', 0),
('Google Haberler: siber güvenlik', 'https://news.google.com/rss/search?q=siber+g%C3%BCvenlik&hl=tr&gl=TR&ceid=TR:tr', 'haber', 'tr', 1),
-- Yapay zekâ
('TechCrunch AI', 'https://techcrunch.com/category/artificial-intelligence/feed/', 'haber', 'en', 1),
('The Verge AI', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', 'haber', 'en', 0),
('OpenAI News', 'https://openai.com/news/rss.xml', 'haber', 'en', 1),
('Google AI Blog', 'https://blog.google/technology/ai/rss/', 'haber', 'en', 0),
('Hugging Face Blog', 'https://huggingface.co/blog/feed.xml', 'haber', 'en', 0),
('Google Haberler: yapay zeka', 'https://news.google.com/rss/search?q=yapay+zeka&hl=tr&gl=TR&ceid=TR:tr', 'haber', 'tr', 0),
-- Mobil geliştirme
('Android Developers Blog', 'https://android-developers.googleblog.com/feeds/posts/default', 'haber', 'en', 2),
('Kotlin Blog', 'https://blog.jetbrains.com/kotlin/feed/', 'haber', 'en', 2),
('Flutter (Medium)', 'https://medium.com/feed/flutter', 'haber', 'en', 2),
('DEV: Flutter', 'https://dev.to/feed/tag/flutter', 'haber', 'en', 0),
-- Genel teknoloji
('Hacker News (150+ puan)', 'https://hnrss.org/frontpage?points=150', 'haber', 'en', 0),
('GitHub Blog', 'https://github.blog/feed/', 'haber', 'en', 0),
('Webtekno', 'https://www.webtekno.com/rss.xml', 'haber', 'tr', -1),
('ShiftDelete.Net', 'https://shiftdelete.net/feed', 'haber', 'tr', -1),
-- İş ve staj ilanları
('HN İş İlanları', 'https://hnrss.org/jobs', 'ilan', 'en', 0),
('We Work Remotely: Programlama', 'https://weworkremotely.com/categories/remote-programming-jobs.rss', 'ilan', 'en', 0),
('Himalayas: Uzaktan İşler', 'https://himalayas.app/jobs/rss', 'ilan', 'en', 0),
('Remotive: Yazılım', 'https://remotive.com/remote-jobs/feed/software-development', 'ilan', 'en', 0),
('Google Haberler: yazılım stajı', 'https://news.google.com/rss/search?q=yaz%C4%B1l%C4%B1m+staj&hl=tr&gl=TR&ceid=TR:tr', 'ilan', 'tr', 1),
-- Etkinlik ve fırsatlar
('DEV Challenges', 'https://dev.to/feed/tag/devchallenge', 'firsat', 'en', 0),
('DEV: hackathon', 'https://dev.to/feed/tag/hackathon', 'firsat', 'en', 0),
('Google Haberler: hackathon', 'https://news.google.com/rss/search?q=hackathon&hl=tr&gl=TR&ceid=TR:tr', 'firsat', 'tr', 1),
('Google Haberler: öğrenci bursu ve yarışma', 'https://news.google.com/rss/search?q=%C3%B6%C4%9Frenci+yaz%C4%B1l%C4%B1m+yar%C4%B1%C5%9Fmas%C4%B1+OR+burs&hl=tr&gl=TR&ceid=TR:tr', 'firsat', 'tr', 0)
on conflict (url) do nothing;
