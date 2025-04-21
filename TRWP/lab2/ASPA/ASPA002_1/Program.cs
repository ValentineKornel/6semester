internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var app = builder.Build();

        app.UseDefaultFiles();
        app.UseStaticFiles("");
        

        app.UseWelcomePage("/aspnetcore");

        app.MapGet("/aspnetcore", () => "Hello World!");

        app.Run();
    }
}