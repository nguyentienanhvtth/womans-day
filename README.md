# TogetherWeRise - Dự án 8/3

Một trang web tương tác thời gian thực cho ngày Quốc tế Phụ nữ, nơi mọi người có thể cùng nhau xây dựng một biểu tượng bằng cách thêm các khối màu và lời chúc.

## Tính năng

- Tương tác thời gian thực với Firebase Realtime Database
- Giao diện người dùng đẹp mắt và thân thiện
- Hiệu ứng animation mượt mà
- Không cần backend riêng

## Yêu cầu

- Node.js 18+
- Tài khoản Firebase (miễn phí)

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd womans-day
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo project trên Firebase:
   - Truy cập https://console.firebase.google.com/
   - Tạo project mới
   - Trong project settings, tìm config và tạo file `.env.local` với nội dung:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Khởi chạy ứng dụng:
```bash
npm run dev
```

Truy cập http://localhost:3000 để xem ứng dụng.

## Deploy

Dự án này có thể được deploy lên Vercel với một vài bước đơn giản:

1. Push code lên GitHub
2. Kết nối repository với Vercel
3. Thêm các biến môi trường Firebase trong Vercel
4. Deploy!
