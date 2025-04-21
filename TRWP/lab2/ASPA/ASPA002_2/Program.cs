using Microsoft.Extensions.FileProviders;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var app = builder.Build();
        
        app.UseDefaultFiles(new DefaultFilesOptions
        {
            DefaultFileNames = new List<string> {
                "Neumann.html" }
        });
        app.UseStaticFiles();

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(
            Path.Combine(Directory.GetCurrentDirectory(), "Picture")),
            RequestPath = "/static"
        });
        app.UseStaticFiles("/static");



        app.UseWelcomePage("/aspnetcore");

        app.MapGet("/aspnetcore", () => "Hello World!");



        app.Run();
    }
}