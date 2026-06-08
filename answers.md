# PHẦN A — KIỂM TRA ĐỌC HIỂU

## Câu A1 (5đ) — Sync vs Async

Thứ tự output:

1. `1 - Start`
2. `4 - End`
3. `3 - Promise`
4. `6 - Promise 2`
5. `2 - Timeout 0ms`
6. `7 - Nested timeout`
7. `5 - Timeout 100ms`

Giải thích:
- `console.log("1 - Start")` và `console.log("4 - End")` chạy đồng bộ ngay lập tức.
- `setTimeout(..., 0)` tạo callback vào **macrotask queue**.
- `Promise.resolve().then(...)` tạo callback vào **microtask queue**.
- Sau khi stack đồng bộ hết, event loop ưu tiên xử lý microtask trước macrotask. Vì vậy `3 - Promise` và `6 - Promise 2` chạy trước `2 - Timeout 0ms`.
- Trong callback `Promise.resolve().then(...)`, `setTimeout(..., 0)` được thêm vào macrotask queue mới. Do đó `7 - Nested timeout` chạy sau `2 - Timeout 0ms`.
- `setTimeout(..., 100)` chạy sau cùng khi đủ 100ms đã trôi qua.

## Câu A2 (5đ) — Fetch API

1. `await fetch(...)` — `fetch` trả về một `Promise<Response>`. Cần `await` để chờ promise đó resolve và nhận được đối tượng `Response` trước khi dùng tiếp.
2. `response.ok` — false khi server trả về HTTP error (trạng thái 4xx hoặc 5xx). Ví dụ: `404 Not Found`, `500 Internal Server Error`, `429 Too Many Requests`.
3. `response.json()` — trả về một `Promise` vì việc parse body JSON là bất đồng bộ. Cần `await` lần nữa để chờ JSON được chuyển thành object JavaScript.
4. `try...catch` — Catch được:
   - lỗi network như mất mạng, DNS, CORS hoặc request bị abort;
   - lỗi do `throw new Error(...)` khi `response.ok` là false;
   - lỗi parse JSON nếu dữ liệu trả về không hợp lệ;
   - lỗi runtime khác nằm trong async function.

## Câu A3 (5đ) — Promise States

Promise có 3 trạng thái:

- `Pending` → `Fulfilled`
- `Pending` → `Rejected`

Khi được tạo, promise ở trạng thái `Pending`. Nếu hoạt động thành công thì chuyển sang `Fulfilled`; nếu có lỗi thì chuyển sang `Rejected`.

### Callback Hell là gì?

Callback Hell là khi code async bị lồng quá sâu, khó đọc và khó bảo trì vì mỗi bước tiếp theo phải nằm bên trong callback của bước trước.

Ví dụ 4 cấp callback hell:

```javascript
function step1(data, callback) {
  setTimeout(() => callback(null, `${data} -> step1`), 200);
}

function step2(data, callback) {
  setTimeout(() => callback(null, `${data} -> step2`), 200);
}

function step3(data, callback) {
  setTimeout(() => callback(null, `${data} -> step3`), 200);
}

function step4(data, callback) {
  setTimeout(() => callback(null, `${data} -> step4`), 200);
}

step1("start", (err1, result1) => {
  if (err1) return console.error(err1);
  step2(result1, (err2, result2) => {
    if (err2) return console.error(err2);
    step3(result2, (err3, result3) => {
      if (err3) return console.error(err3);
      step4(result3, (err4, result4) => {
        if (err4) return console.error(err4);
        console.log(result4);
      });
    });
  });
});
```

Refactor thành async/await:

```javascript
async function runSteps() {
  try {
    const result1 = await step1("start");
    const result2 = await step2(result1);
    const result3 = await step3(result2);
    const result4 = await step4(result3);
    console.log(result4);
  } catch (error) {
    console.error(error);
  }
}
```

# PHẦN C — PHÂN TÍCH

## Câu C1 (10đ) — Error Handling Strategy

1. Network errors
- Khi mất mạng giữa chừng, app nên chuyển sang trạng thái Error và hiển thị thông báo rõ ràng.
- Có thể dùng `navigator.onLine` để kiểm tra offline, hoặc bắt lỗi `fetch` reject.
- Nên cho user thử lại (retry) hoặc dùng nút `Refresh`.

2. API errors
- Với lỗi `4xx` (ví dụ 404): thông báo cho user là tài nguyên không tìm thấy hoặc endpoint sai.
- Với lỗi `5xx` (ví dụ 500): thông báo server gặp sự cố và đề nghị thử lại sau.
- Với lỗi `429 Too Many Requests`: thông báo giới hạn tần suất, có thể yêu cầu đợi vài giây trước khi gửi lại.
- Luôn kiểm tra `response.ok` sau `fetch`, vì `fetch` chỉ reject trong trường hợp network error, không reject với HTTP 4xx/5xx.

3. Timeout
- Dùng `AbortController` để hủy request nếu API quá chậm > 10 giây.

```javascript
function fetchWithTimeout(url, ms = 10000, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  return fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => clearTimeout(timeoutId));
}
```

4. Retry logic
- Nếu lỗi network, thử lại tối đa 3 lần trước khi báo lỗi.
- Nếu lỗi HTTP 4xx/5xx, không nên retry tự động trừ phi lỗi tạm thời như 429 hoặc 500.

```javascript
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, maxRetries = 3, options = {}) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await fetchWithTimeout(url, 10000, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      const isNetworkError = error.name === 'TypeError' || error.name === 'AbortError';
      attempt += 1;
      if (!isNetworkError || attempt >= maxRetries) {
        throw error;
      }
      await sleep(500);
    }
  }
}
```

## Câu C2 (10đ) — Promise.all vs Promise.allSettled vs Promise.race vs Promise.any

| Method | Khi nào resolve? | Khi nào reject? | Use case |
|---|---|---|---|
| `Promise.all()` | Khi tất cả promise đều fulfilled | Ngay khi một promise reject | Khi nhiều request đều cần thành công để render một trang (ví dụ user + cart + settings) |
| `Promise.allSettled()` | Khi tất cả promise đã settle (fulfilled hoặc rejected) | Không bao giờ reject | Khi cần hiển thị nhiều widget độc lập và một widget lỗi không làm hỏng các widget khác |
| `Promise.race()` | Khi promise đầu tiên settle (fulfilled hoặc rejected) | Khi promise đầu tiên reject | Khi muốn timeout hoặc lấy phản hồi nhanh nhất từ nhiều mirror endpoints |
| `Promise.any()` | Khi một promise đầu tiên fulfilled | Khi tất cả promise reject | Khi có nhiều nguồn dự phòng và chỉ cần một nguồn thành công |

### Ví dụ thực tế

`Promise.all()`
```javascript
const [user, cart, settings] = await Promise.all([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/cart').then(r => r.json()),
  fetch('/api/settings').then(r => r.json())
]);
```
- Dùng khi trang cần cả 3 dữ liệu để render chính xác.

`Promise.allSettled()`
```javascript
const results = await Promise.allSettled([
  fetch('/api/posts').then(r => r.json()),
  fetch('/api/comments').then(r => r.json()),
  fetch('/api/users').then(r => r.json())
]);

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    renderWidget(index, result.value);
  } else {
    renderWidgetError(index, result.reason.message);
  }
});
```
- Dùng cho dashboard nhiều widget, API riêng lẻ, 1 API lỗi không ảnh hưởng widget khác.

`Promise.race()`
```javascript
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Request timeout')), 5000)
);

const response = await Promise.race([
  fetch('/api/data'),
  timeoutPromise
]);
```
- Dùng để bỏ request khi quá chậm và ưu tiên thời gian phản hồi nhanh.

`Promise.any()`
```javascript
const user = await Promise.any([
  fetch('/api/cache/user').then(r => r.json()),
  fetch('/api/primary/user').then(r => r.json())
]);
```
- Dùng khi có nhiều nguồn dự phòng và chỉ cần dữ liệu từ nguồn đầu tiên thành công.