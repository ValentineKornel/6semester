using System.Reflection.Emit;

namespace DAL_Celebrity_MSSQL
{
   
    public interface IRepository: DAL_Celebrity.IRepository<Celebrity, Lifeevent> 
    {
       
    }
    
    public class Celebrity  //  Знаменитость  
    {
        public Celebrity() { this.FullName = string.Empty; this.Nationality = string.Empty; }
        public int Id { get; set; }                        // Id Знаменитости        
        public string FullName { get; set; }               // полное имя   Знаменитости
        public string Nationality { get; set; }            // гражданство  Знаменитости ( 2 символа ISO )
        public string? ReqPhotoPath { get; set; }          // reguest path  Фотографии   
        public virtual bool Update(Celebrity celebrity)    // --вспомогательный метод  
        {
            if (!string.IsNullOrEmpty(celebrity.FullName)) this.FullName = celebrity.FullName;
            if (!string.IsNullOrEmpty(celebrity.Nationality)) this.Nationality = celebrity.Nationality;
            if (!string.IsNullOrEmpty(celebrity.ReqPhotoPath)) this.ReqPhotoPath = celebrity.ReqPhotoPath;
            return true;     //  изменения были ?
        }
    }

    public class Lifeevent  //  Событие в  жизни знаменитости 
    {
        public Lifeevent() { this.Description = string.Empty; }
        public int Id { get; set; }                             // Id События  
        public int CelebrityId { get; set; }                    // Id Знаменитости
        public DateTime? Date { get; set; }                     // дата События 
        public string Description { get; set; }                 // описание События 
        public string? ReqPhotoPath { get; set; }               // reguest path  Фотографии
        public virtual bool Update(Lifeevent lifeevent)         // -- вспомогательный метод                                           
        {
            if (!(lifeevent.CelebrityId <= 0)) this.CelebrityId = lifeevent.CelebrityId;
            if (!lifeevent.Date.Equals(new DateTime())) this.Date = lifeevent.Date;
            if (!string.IsNullOrEmpty(lifeevent.Description)) this.Description = lifeevent.Description;
            if (!string.IsNullOrEmpty(lifeevent.ReqPhotoPath)) this.ReqPhotoPath = lifeevent.ReqPhotoPath;
            return true;     //  изменения были ?
        }
    }
}
#region IRepository
//public interface IRepository: IRepository<Celebrity, Lifeevent>, IDisposable { }; 
//public interface IRepository<T1,T2>: ICelebrity, ILifeevent 
//{
//    List<T2> GetLifeeventsByCelebrityId(int celebrityId);  // получить все События по Id Знаменитости
//    T1       GetCelebrityByLifeeventId(int lifeeventId);   // получить Знаменитость по Id Событияи
//}
//public interface ICelebrity : ICelebrity<Celebrity> { }
//public interface ILifeevent : ILifeevent<Lifeevent> { }
//public interface ICelebrity<T>: IDisposable 
//{
//    List<T> GetAllCelebrities();                      // получить все Знаменитости 
//    T GetCelebrityById(int Id);                       // получить Знаменитость по Id 
//    bool DelCelebrity(int id);                        // удалить Знаменитость по Id 
//    bool AddCelebrity(T celebrity);                   // добавить Знаменитость  
//    bool UpdCelebrity(int id, T celebrity);           // изменить Знаменитость по  Id 
//}
//public interface ILifeevent<T>:IDisposable
//{
//    List<T> GetAllLifeevents();                       // получить все События 
//    T GetLifeevetById(int Id);                        // получить Событие по Id 
//    bool DelLifeevent(int id);                        // удалить Событие  по Id 
//    bool AddLifeevent(T lifeevent);                   // добавить Событие  
//    bool UpdLifeevent(int id, T lifeevent);           // изменить обытие по  Id  
//}
//public class Celebrity  //  Знаменитость  
//{  
//    public Celebrity() {this.FullName = ""; this.Nationality = ""; }
//    public int Id             { get; set; }           // Id Знаменитости        
//    public string FullName    { get; set; }           // полное имя   Знаменитости
//    public string Nationality { get; set; }           // гражданство  Знаменитости
//    // ФОТО 
//}
//public class Lifeevent  //  Событие в  жизни знаменитости 
//{
//    public Lifeevent() { this.Description = ""; }
//    public int Id               { get; set; }        // Id События  
//    public int CelebrityId      { get; set; }        // Id Знаменитости
//    public DateTime Date        { get; set; }        // дата События 
//    public string   Description { get; set; }        // описание События 
//    // ФОТО 
//}
#endregion
