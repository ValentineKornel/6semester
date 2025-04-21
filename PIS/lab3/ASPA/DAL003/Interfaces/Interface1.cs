using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL003.Interfaces
{
    public interface IRepository: IDisposable
    {
        static string JSONFilename { get; set; }
        string BasePath { get; }
        Celebrity[] getAllCelebrities();
        Celebrity? getCelebrityById(int id);
        Celebrity[] getCelebritiesBySurname(string surname);
        string? getPhotoPathById(int id);
    }

    public record Celebrity(int Id, string Firstname, string Surname, string PhotoPath);
}
