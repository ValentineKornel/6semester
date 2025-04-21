using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL003
{
    public interface IRepository: IDisposable
    {
        string BasePath { get; }
        Celebrity[] getAllCelebrities();
        Celebrity? getCelebrityById(int id);
        Celebrity[] getCelebritiesBySurname(string surname);
        string? getPhotoPathById(int id);
        int? addCelebrity(Celebrity celebrity);
        bool deleteSelebrity(int id);
        int? updateSelebrity(int id, Celebrity celebrity);
        int SaveChanges();

    }

    public class Celebrity
    {
        public int? Id { get; set; }
        public string Firstname { get; set; }
        public string Surname { get; set; }
        public string PhotoPath { get; set; }

        public Celebrity(int? id, string firstname, string surname, string photoPath)
        {
            Id = id;
            Firstname = firstname;
            Surname = surname;
            PhotoPath = photoPath;
        }
    }
    //public record Celebrity(int Id, string Firstname, string Surname, string PhotoPath);
}
