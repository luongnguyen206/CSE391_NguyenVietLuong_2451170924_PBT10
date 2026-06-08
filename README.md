# CSE391_NguyenVietLuong_2451170924_PBT10

**ASYNC JAVASCRIPT & API INTEGRATION**

## Thông tin sinh viên
- Họ và tên: Nguyễn Việt Lương
- Lớp: 66KTPM2
- MSV: 2451170924

## Nội dung PBT10
Phiếu bài tập tập trung vào:
- ✅ **Synchronous vs Asynchronous**: Event Loop, Call Stack, Task Queue, Microtask Queue
- ✅ **Promises**: States (Pending/Fulfilled/Rejected), Chaining, Error handling
- ✅ **Async/Await**: Syntax, Error handling with try/catch, Sequential vs Parallel
- ✅ **Fetch API**: GET/POST/PUT/DELETE requests, Response handling, JSON parsing
- ✅ **Error Handling**: Network errors, HTTP errors, Timeouts, Retry logic
- ✅ **Promise Combinators**: Promise.all(), Promise.allSettled(), Promise.race(), Promise.any()
- ✅ **Real API Integration**: Multiple data sources, Loading states, Infinite scroll, LocalStorage

## Tệp hoàn thành (4 Mini-Apps)
- `answers.md` — Phần A & C (lý thuyết + phân tích)
- `weather_app/` — Weather App folder
  - API: Open-Meteo / wttr.in
  - Chức năng: Search by city, Display weather, 3 states (Loading/Success/Error), History with LocalStorage
- `user_directory/` — User Directory (CRUD) folder
  - API: JSONPlaceholder
  - Chức năng: List users, Create, Read, Update, Delete, Search, Error handling
- `gallery/` — Infinite Scroll Gallery folder
  - API: JSONPlaceholder Photos / Lorem Picsum
  - Chức năng: Infinite scroll, Lazy loading, Lightbox modal, Responsive grid
- `dashboard/` — Multi-API Dashboard folder
  - APIs: 3+ sources (JSONPlaceholder, Open-Meteo, REST Countries, Random User, Dog API)
  - Chức năng: Parallel API calls, Individual widget states, Promise.allSettled(), Refresh all
- `screenshots/` — App demos (Loading states, Success states, Error states)