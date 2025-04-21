using DAL003.Repositories;
using DAL003.Interfaces;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var photoDirectory = "D:\\Study\\university\\PIS\\лаб3\\ASPA\\DAL003\\Celebrities\\";

if (!Directory.Exists(photoDirectory))
{
    Directory.CreateDirectory(photoDirectory);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(photoDirectory),
    RequestPath = "/Photo"
});

app.UseDirectoryBrowser(new DirectoryBrowserOptions
{
    FileProvider = new PhysicalFileProvider(photoDirectory),
    RequestPath = "/download"
});

app.MapGet("/download/{filename}", (string filename) =>
{
    var filePath = Path.Combine(photoDirectory, filename);

    if (!File.Exists(filePath))
    {
        return Results.NotFound("Файл не найден");
    }
    return Results.File(filePath, "application/octet-stream", filename);
});

Repository.JSONFilename = "Celebrities.json";
IRepository repository = new Repository(photoDirectory);

app.MapGet("/", () => "Hello world");
app.MapGet("/celebrities", () => repository.getAllCelebrities());
app.MapGet("/celebrities/{id}", (int id) => repository.getCelebrityById(id));
app.MapGet("/celebrities/BySurname/{surname}", (string surname) => repository.getCelebritiesBySurname(surname));
app.MapGet("/celebrities/PhotoPath/{id}", (int id) => repository.getPhotoPathById(id));

app.Run();
