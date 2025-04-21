using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class Test
{
    class Answer<T>
    {
        public T? x { get; set; } = default(T?);
        public T? y { get; set; } = default(T?);
        public string? message { get; set; } = null;
    }
    public static string Ok = "OK", NOK = "NOK";
    HttpClient client = new HttpClient();
    public async Task ExecuteGet<T>(string path, Func<T, T?, int, string?> result)
    {
        await resultPRINT<T>("GET", path, await this.client.GetAsync(path), result);
    }
    public async Task ExecutePost<T>(string path, Func<T, T?, int, string?> result)
    {
        await resultPRINT<T>("POST", path, await this.client.PostAsync(path, null), result);
    }
    public async Task ExecutePut<T>(string path, Func<T, T?, int, string?> result)
    {
        await resultPRINT<T>("PUT", path, await this.client.PutAsync(path, null), result);
    }
    public async Task ExecuteDelete<T>(string path, Func<T, T?, int, string?> result)
    {
        await resultPRINT<T>("DELETE", path, await this.client.DeleteAsync(path), result);
    }
    async Task resultPRINT<T>(string method, string path, HttpResponseMessage rm, Func<T?, T?, int, string> result)
    {
        int status = (int)rm.StatusCode;
        try
        {
            Answer<T> answer = await rm.Content.ReadFromJsonAsync<Answer<T>>() ?? default(Answer<T>);
            string r = result(default(T), default(T), status);
            T? x = default(T), y = default(T);
            if (answer != null) r = result(x = answer.x, y = answer.y, status);
            Console.WriteLine($"{r}:{method} {path}, status = {status}, x = {x}, y = {y}, m = {answer?.message}");
        }
        catch (JsonException ex)
        {
            string r = result(default(T), default(T), status);
            Console.WriteLine($"{r}:{method} {path}, status = {status}, x = {null}, y = {null}, m = {ex.Message}");
        }
    }
}
