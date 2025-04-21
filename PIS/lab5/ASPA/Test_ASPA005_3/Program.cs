using static System.Net.Mime.MediaTypeNames;

Test test = new Test();
Console.WriteLine("-- /A ------------------------------");
await test.ExecuteGet<int?>("http://localhost:5000/A/3", (int? x, int? y, int status) => (x == 3 && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteGet<int?>("http://localhost:5000/A/-3", (int? x, int? y, int status) => (x == -3 && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteGet<int?>("http://localhost:5000/A/18", (int? x, int? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecutePost<int?>("http://localhost:5000/A/5", (int? x, int? y, int status) => (x == 5 && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecutePost<int?>("http://localhost:5000/A/-5", (int? x, int? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecutePut<int?>("http://localhost:5000/A/2/3", (int? x, int? y, int status) => (x == 3 && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecutePut<int?>("http://localhost:5000/A/0/3", (int? x, int? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecutePut<int?>("http://localhost:5000/A/25/-3", (int? x, int? y, int status) => (x == 2 && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecutePut<int?>("http://localhost:5000/A/0/-3", (int? x, int? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecuteDelete<int?>("http://localhost:5000/A/-99", (int? x, int? y, int status) => (x == 11 && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteDelete<int?>("http://localhost:5000/A/99-1", (int? x, int? y, int status) => (x == 99 && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteDelete<int?>("http://localhost:5000/A/-1-25", (int? x, int? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecuteDelete<int?>("http://localhost:5000/A/-1-25", (int? x, int? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecuteDelete<int?>("http://localhost:5000/A/25-11", (int? x, int? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);

Console.WriteLine("-- /B ------------------------------");
await test.ExecuteGet<float?>("http://localhost:5000/B/2.5", (float? x, float? y, int status) => (x == 2.5f && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteGet<float?>("http://localhost:5000/B/2", (float? x, float? y, int status) => (x == 2.0f && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteGet<float?>("http://localhost:5000/B/2X", (float? x, float? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecutePost<float?>("http://localhost:5000/B/2.5/3.2", (float? x, float? y, int status) => (x == 2.5f && y == 3.2f && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteDelete<float?>("http://localhost:5000/B/2.5-3.2", (float? x, float? y, int status) => (x == 2.5f && y == 3.2f && status == 200) ? Test.Ok : Test.NOK);

Console.WriteLine("-- /C ------------------------------");
await test.ExecuteGet<bool?>("http://localhost:5000/C/2.5", (bool? x, bool? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecuteGet<bool?>("http://localhost:5000/C/true", (bool? x, bool? y, int status) => (x == true && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecutePost<bool?>("http://localhost:5000/C/true_false", (bool? x, bool? y, int status) => (x == true && y == false && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteDelete<bool?>("http://localhost:5000/C/true_false", (bool? x, bool? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);

Console.WriteLine("-- /D -------------------------------------------------------------");
await test.ExecuteGet<DateTime?>("http://localhost:5000/D/2025-02-25", (DateTime? x, DateTime? y, int status) => (x == new DateTime(2025, 02, 25) && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteGet<DateTime?>("http://localhost:5000/D/2025-02-29", (DateTime? x, DateTime? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecuteGet<DateTime?>("http://localhost:5000/D/2024-02-29", (DateTime? x, DateTime? y, int status) => (x == new DateTime(2024, 02, 29) && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteGet<DateTime?>("http://localhost:5000/D/2025-02-25T19:25", (DateTime? x, DateTime? y, int status) => (x == new DateTime(2025, 02, 25, 19, 25, 0) && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecutePost<DateTime?>("http://localhost:5000/D/2025-03-25", (DateTime? x, DateTime? y, int status) => (x == new DateTime(2025, 02, 25) && y == new DateTime(2025, 03, 25) && status == 200) ? Test.Ok : Test.NOK);
await test.ExecutePut<DateTime?>("http://localhost:5000/D/2025-02-25T19:25", (DateTime? x, DateTime? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);

Console.WriteLine("-- /E ------------------------------");
await test.ExecuteGet<string?>("http://localhost:5000/E/12-bis", (string? x, string? y, int status) => (x == "bis" && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteGet<string?>("http://localhost:5000/E/12-bis", (string? x, string? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecuteGet<string?>("http://localhost:5000/E/12", (string? x, string? y, int status) => (x == "777" && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteGet<string?>("http://localhost:5000/E/12", (string? x, string? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecuteGet<string?>("http://localhost:5000/E/abcd", (string? x, string? y, int status) => (x == "abcd" && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteGet<string?>("http://localhost:5000/E/abcd123", (string? x, string? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecuteGet<string?>("http://localhost:5000/E/a", (string? x, string? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecuteGet<string?>("http://localhost:5000/E/123456", (string? x, string? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecuteGet<string?>("http://localhost:5000/E/1234abcddeeffgghh", (string? x, string? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);

Console.WriteLine("-- /F ------------------------------");
await test.ExecuteGet<string?>("http://localhost:5000/F/smw@belstu.by", (string? x, string? y, int status) => (x == "smw@belstu.by" && y == null && status == 200) ? Test.Ok : Test.NOK);
await test.ExecuteGet<string?>("http://localhost:5000/F/xxx@yyy.by", (string? x, string? y, int status) => (x == "xxx@yyy.by" && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecuteGet<string?>("http://localhost:5000/F/yyy.ru", (string? x, string? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecuteGet<string?>("http://localhost:5000/F/xxx@yyy.by", (string? x, string? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);
await test.ExecuteGet<string?>("http://localhost:5000/F/xxx@yyy", (string? x, string? y, int status) => (x == null && y == null && status == 404) ? Test.Ok : Test.NOK);

Console.ReadLine();