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
    case WSAEINTR:                 msgText = "������ ������� ��������";                           break;
    case WSAEACCES:                msgText = "���������� ����������";                             break;
    case WSAEFAULT:                msgText = "��������� �����";                                   break;
    case WSAEINVAL:                msgText = "������ � ��������� ";                               break;
    case WSAEMFILE:                msgText = "������� ����� ������ �������";                      break;
    case WSAEWOULDBLOCK:           msgText = "������ �������� ����������";                        break;
    case WSAEINPROGRESS:           msgText = "�������� � �������� ��������";                      break;
    case WSAEALREADY:              msgText = "�������� ��� ����������� ";                         break;
    case WSAENOTSOCK:              msgText = "����� ����� �����������   ";                        break;
    case WSAEDESTADDRREQ:          msgText = "��������� ����� ������������ ";                     break;
    case WSAEMSGSIZE:              msgText = "��������� ������� ������� ";                        break;
    case WSAEPROTOTYPE:            msgText = "������������ ��� ��������� ��� ������ ";            break;
    case WSAENOPROTOOPT:           msgText = "������ � ����� ���������";                          break;
    case WSAEPROTONOSUPPORT:       msgText = "�������� �� �������������� ";                       break;
    case WSAESOCKTNOSUPPORT:       msgText = "��� ������ �� �������������� ";                     break;
    case WSAEOPNOTSUPP:            msgText = "�������� �� �������������� ";                       break;
    case WSAEPFNOSUPPORT:          msgText = "��� ���������� �� �������������� ";                 break;
    case WSAEAFNOSUPPORT:          msgText = "��� ������� �� �������������� ����������";          break;
    case WSAEADDRINUSE:            msgText = "����� ��� ������������ ";                           break;
    case WSAEADDRNOTAVAIL:         msgText = "����������� ����� �� ����� ���� �����������";       break;
    case WSAENETDOWN:              msgText = "���� ��������� ";                                   break;
    case WSAENETUNREACH:           msgText = "���� �� ���������";                                 break;
    case WSAENETRESET:             msgText = "���� ��������� ����������";                         break;
    case WSAECONNABORTED:          msgText = "����������� ����� ����� ";                          break;
    case WSAECONNRESET:            msgText = "����� ������������� ";                              break;
    case WSAENOBUFS:               msgText = "�� ������� ������ ��� �������";                     break;
    case WSAEISCONN:               msgText = "����� ��� ���������";                               break;
    case WSAENOTCONN:              msgText = "����� �� ���������";                                break;
    case WSAESHUTDOWN:             msgText = "������ ��������� send: ����� �������� ������";      break;
    case WSAETIMEDOUT:             msgText = "���������� ���������� ��������  �������";           break;
    case WSAECONNREFUSED:          msgText = "���������� ���������  ";                            break;
    case WSAEHOSTDOWN:             msgText = "���� � ����������������� ���������";                break;
    case WSAEHOSTUNREACH:          msgText = "��� �������� ��� ����� ";                           break;
    case WSAEPROCLIM:              msgText = "������� ����� ��������� ";                          break;
    case WSASYSNOTREADY:           msgText = "���� �� �������� ";                                 break;
    case WSAVERNOTSUPPORTED:       msgText = "������ ������ ���������� ";                         break;
    case WSANOTINITIALISED:        msgText = "�� ��������� ������������� WS2_32.DLL";             break;
    case WSAEDISCON:               msgText = "����������� ����������";                            break;
    case WSATYPE_NOT_FOUND:        msgText = "����� �� ������ ";                                  break;
    case WSAHOST_NOT_FOUND:        msgText = "���� �� ������";                                    break;
    case WSATRY_AGAIN:             msgText = "������������������ ���� �� ������";                 break;
    case WSANO_RECOVERY:           msgText = "��������������  ������";                            break;
    case WSANO_DATA:               msgText = "��� ������ ������������ ����";                      break;
    case WSA_INVALID_HANDLE:       msgText = "��������� ���������� �������  � �������";           break;
    case WSA_INVALID_PARAMETER:    msgText = "���� ��� ����� ���������� � �������";               break;
    case WSA_IO_INCOMPLETE:        msgText = "������ �����-������ �� � ���������� ���������";     break;
    case WSA_IO_PENDING:           msgText = "�������� ���������� �����  ";                       break;
    case WSA_NOT_ENOUGH_MEMORY:    msgText = "�� ���������� ������ ";                             break;
    case WSA_OPERATION_ABORTED:    msgText = "�������� ���������� ";                              break;
        //case WSAINVALIDPROCTABLE:      msgText = "��������� ������ ";                                 break;
        //case WSAINVALIDPROVIDER:       msgText = "������ � ������ �������  ";                         break;
        //case WSAPROVIDERFAILEDINIT:    msgText = "���������� ���������������� ������ ";               break;
    case WSASYSCALLFAILURE:        msgText = "��������� ���������� ���������� ������ ";           break;

    default:                       msgText = "***ERROR***";                                       break;
    }
    return msgText;
}

string SetErrorMsgText(string msgText, int code)
{
    return msgText + GetErrorMsgText(code);
}

//13
//int main()
//{
//    setlocale(LC_ALL, "Russian");
//    SOCKET cC;
//    WSADATA wsaData;
//
//    try
//    {
//        if (WSAStartup(MAKEWORD(2, 0), &wsaData) != 0)
//            throw SetErrorMsgText("Startup: ", WSAGetLastError());
//
//
//        if ((cC = socket(AF_INET, SOCK_STREAM, NULL)) == INVALID_SOCKET)
//            throw SetErrorMsgText("socket:", WSAGetLastError());
//
//        SOCKADDR_IN serv;
//        serv.sin_family = AF_INET;
//        serv.sin_port = htons(2000);
//        serv.sin_addr.s_addr = inet_addr("127.0.0.1");
//
//        if ((connect(cC, (sockaddr*)&serv, sizeof(serv))) == SOCKET_ERROR)
//            throw SetErrorMsgText("connect: ", WSAGetLastError());
//
//
//        for (int i = 1; i < 2; i++) {
//            char obuf[50] = "Time";
//            int lobuf = 0;
//            char numbuf[4];
//            char ibuf[50];
//            int libuf = 0;
//            //_itoa(i, numbuf, 10);
//            //strcat(obuf, numbuf);
//
//            if ((lobuf = send(cC, obuf, strlen(obuf)+1, NULL)) == SOCKET_ERROR)
//                throw SetErrorMsgText("send: ", WSAGetLastError());
//            this_thread::sleep_for(chrono::milliseconds(10));
//
//            if ((libuf = recv(cC, ibuf, sizeof(ibuf), NULL)) == SOCKET_ERROR)
//                throw SetErrorMsgText("recv: ", WSAGetLastError());
//                
//            cout << ibuf << endl;
//        }
//        Sleep(2000);
//        cout << "ok" << endl;
//
//
//        if (closesocket(cC) == SOCKET_ERROR)
//            throw SetErrorMsgText("closesocket: ", WSAGetLastError());
//        if (WSACleanup() == SOCKET_ERROR)
//            throw SetErrorMsgText("Cleanup: ", WSAGetLastError());
//
//        cout << "ok" << endl;
//    }
//    catch (string errorMsgText) {
//        cout << endl << "WSAGetLastError: " << errorMsgText;
//    }
//
//    
//
//    return 0;
//}


//14
int main()
{
    setlocale(LC_ALL, "Russian");
    SOCKET cC;
    WSADATA wsaData;

    try
    {
        if (WSAStartup(MAKEWORD(2, 0), &wsaData) != 0)
            throw SetErrorMsgText("Startup: ", WSAGetLastError());


        if ((cC = socket(AF_INET, SOCK_STREAM, NULL)) == INVALID_SOCKET)
            throw SetErrorMsgText("socket:", WSAGetLastError());

        SOCKADDR_IN serv;
        serv.sin_family = AF_INET;
        serv.sin_port = htons(4000);
        serv.sin_addr.s_addr = inet_addr("127.0.0.1");

        if ((connect(cC, (sockaddr*)&serv, sizeof(serv))) == SOCKET_ERROR)
            throw SetErrorMsgText("connect: ", WSAGetLastError());

        char obuf[50] = "Hello from client";
        int lobuf = 0;

        if ((lobuf = send(cC, obuf, strlen(obuf) + 1, NULL)) == SOCKET_ERROR)
            throw SetErrorMsgText("send: ", WSAGetLastError());

        char ibuf[50];
        int libuf = 0;

        if ((libuf = recv(cC, ibuf, sizeof(ibuf), NULL)) == SOCKET_ERROR)
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