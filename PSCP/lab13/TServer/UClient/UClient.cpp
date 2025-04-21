#include <iostream>
#include "Winsock2.h"
#pragma comment(lib, "WS2_32.lib")
#include <chrono>
#include <thread>
#pragma warning(disable : 4996)
using namespace std;


#define INADDR_ANY        (u_long)0x00000000 //����� �����       +++ 
#define INADDR_LOOPBACK    0x7f000001        // ���������� ����� +++
#define INADDR_BROADCAST  (u_long)0xffffffff // �������������    +++  
#define INADDR_NONE        0xffffffff        // ��� ������  
#define ADDR_ANY           INADDR_ANY        // ����� �����       

typedef struct sockaddr_in SOCKADDR_IN;    //                     +++
typedef struct sockaddr_in* PSOCKADDR_IN;
typedef struct sockaddr_in FAR* LPSOCKADDR_IN;

string GetErrorMsgText(int code)
{
    string msgText;
    switch (code) {
    case WSAEINTR:                 msgText = "Работа функции прервана";                           break;
    case WSAEACCES:                msgText = "Разрешение отвергнуто";                             break;
    case WSAEFAULT:                msgText = "Ошибочный адрес";                                   break;
    case WSAEINVAL:                msgText = "Ошибка в аргументе ";                               break;
    case WSAEMFILE:                msgText = "Слишком много файлов открыто";                      break;
    case WSAEWOULDBLOCK:           msgText = "Ресурс временно недоступен";                        break;
    case WSAEINPROGRESS:           msgText = "Операция в процессе развития";                      break;
    case WSAEALREADY:              msgText = "Операция уже выполняется ";                         break;
    case WSAENOTSOCK:              msgText = "Сокет задан неправильно   ";                        break;
    case WSAEDESTADDRREQ:          msgText = "Требуется адрес расположения ";                     break;
    case WSAEMSGSIZE:              msgText = "Сообщение слишком длинное ";                        break;
    case WSAEPROTOTYPE:            msgText = "Неправильный тип протокола для сокета ";            break;
    case WSAENOPROTOOPT:           msgText = "Ошибка в опции протокола";                          break;
    case WSAEPROTONOSUPPORT:       msgText = "Протокол не поддерживается ";                       break;
    case WSAESOCKTNOSUPPORT:       msgText = "Тип сокета не поддерживается ";                     break;
    case WSAEOPNOTSUPP:            msgText = "Операция не поддерживается ";                       break;
    case WSAEPFNOSUPPORT:          msgText = "Тип протоколов не поддерживается ";                 break;
    case WSAEAFNOSUPPORT:          msgText = "Тип адресов не поддерживается протоколом";          break;
    case WSAEADDRINUSE:            msgText = "Адрес уже используется ";                           break;
    case WSAEADDRNOTAVAIL:         msgText = "Запрошенный адрес не может быть использован";       break;
    case WSAENETDOWN:              msgText = "Сеть отключена ";                                   break;
    case WSAENETUNREACH:           msgText = "Сеть не достижима";                                 break;
    case WSAENETRESET:             msgText = "Сеть разорвала соединение";                         break;
    case WSAECONNABORTED:          msgText = "Программный отказ связи ";                          break;
    case WSAECONNRESET:            msgText = "Связь восстановлена ";                              break;
    case WSAENOBUFS:               msgText = "Не хватает памяти для буферов";                     break;
    case WSAEISCONN:               msgText = "Сокет уже подключен";                               break;
    case WSAENOTCONN:              msgText = "Сокет не подключен";                                break;
    case WSAESHUTDOWN:             msgText = "Нельзя выполнить send: сокет завершил работу";      break;
    case WSAETIMEDOUT:             msgText = "Закончился отведенный интервал  времени";           break;
    case WSAECONNREFUSED:          msgText = "Соединение отклонено  ";                            break;
    case WSAEHOSTDOWN:             msgText = "Хост в неработоспособном состоянии";                break;
    case WSAEHOSTUNREACH:          msgText = "Нет маршрута для хоста ";                           break;
    case WSAEPROCLIM:              msgText = "Слишком много процессов ";                          break;
    case WSASYSNOTREADY:           msgText = "Сеть не доступна ";                                 break;
    case WSAVERNOTSUPPORTED:       msgText = "Данная версия недоступна ";                         break;
    case WSANOTINITIALISED:        msgText = "Не выполнена инициализация WS2_32.DLL";             break;
    case WSAEDISCON:               msgText = "Выполняется отключение";                            break;
    case WSATYPE_NOT_FOUND:        msgText = "Класс не найден ";                                  break;
    case WSAHOST_NOT_FOUND:        msgText = "Хост не найден";                                    break;
    case WSATRY_AGAIN:             msgText = "Неавторизированный хост не найден";                 break;
    case WSANO_RECOVERY:           msgText = "Неопределенная  ошибка";                            break;
    case WSANO_DATA:               msgText = "Нет записи запрошенного типа";                      break;
    case WSA_INVALID_HANDLE:       msgText = "Указанный дескриптор события  с ошибкой";           break;
    case WSA_INVALID_PARAMETER:    msgText = "Один или более параметров с ошибкой";               break;
    case WSA_IO_INCOMPLETE:        msgText = "Объект ввода-вывода не в сигнальном состоянии";     break;
    case WSA_IO_PENDING:           msgText = "Операция завершится позже  ";                       break;
    case WSA_NOT_ENOUGH_MEMORY:    msgText = "Не достаточно памяти ";                             break;
    case WSA_OPERATION_ABORTED:    msgText = "Операция отвергнута ";                              break;
        //case WSAINVALIDPROCTABLE:      msgText = "Ошибочный сервис ";                                 break;
        //case WSAINVALIDPROVIDER:       msgText = "Ошибка в версии сервиса  ";                         break;
        //case WSAPROVIDERFAILEDINIT:    msgText = "Невозможно инициализировать сервис ";               break;
    case WSASYSCALLFAILURE:        msgText = "Аварийное завершение системного вызова ";           break;

    default:                       msgText = "***ERROR***";                                       break;
    }
    return msgText;
}

string SetErrorMsgText(string msgText, int code)
{
    return msgText + GetErrorMsgText(code);
}


int main()
{
    setlocale(LC_ALL, "Russian");
    SOCKET cC;
    WSADATA wsaData;

    try
    {
        if (WSAStartup(MAKEWORD(2, 0), &wsaData) != 0)
            throw SetErrorMsgText("Startup: ", WSAGetLastError());


        if ((cC = socket(AF_INET, SOCK_DGRAM, NULL)) == INVALID_SOCKET)
            throw SetErrorMsgText("socket:", WSAGetLastError());

        SOCKADDR_IN serv;
        serv.sin_family = AF_INET;
        serv.sin_port = htons(3000);
        serv.sin_addr.s_addr = inet_addr("127.0.0.1");


        char obuf[50] = "Messag 01";
        int lobuf = 0;


        if ((lobuf = sendto(cC, obuf, strlen(obuf) + 1, NULL, (sockaddr*)&serv, sizeof(serv))) == SOCKET_ERROR)
            throw SetErrorMsgText("send: ", WSAGetLastError());

        cout << "message sent" << endl;
        char ibuf[50];
        int libuf = 0;
        int lserv = sizeof(serv);

        if (libuf = recvfrom(cC, ibuf, sizeof(ibuf), NULL, (sockaddr*)&serv, &lserv) == SOCKET_ERROR)
            throw SetErrorMsgText("recv: ", WSAGetLastError());

        cout << ibuf << endl;

        if (closesocket(cC) == SOCKET_ERROR)
            throw SetErrorMsgText("closesocket: ", WSAGetLastError());
        if (WSACleanup() == SOCKET_ERROR)
            throw SetErrorMsgText("Cleanup: ", WSAGetLastError());

    }
    catch (string errorMsgText) {
        cout << endl << "WSAGetLastError: " << errorMsgText;
    }

    

    return 0;
}
