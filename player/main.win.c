#include <windows.h>
#include <stdio.h>
#include <gl\gl.h>
#include <gl\glu.h>

int	keys[256];
#include "main.gl.c"

int	active=1;


void KillGLWindow(HINSTANCE*hInstance,HDC*hDC,HGLRC*hRC,HWND*hWnd,int fullscreen){
	if (fullscreen){
		ChangeDisplaySettings(NULL,0);
		ShowCursor(1);
	}
	if(*hRC){
		wglMakeCurrent(NULL,NULL);
		wglDeleteContext(*hRC);
		*hRC=NULL;
	}
	if((*hDC && !ReleaseDC(*hWnd,*hDC))
	 ||(*hWnd && !DestroyWindow(*hWnd))
	 ||(!UnregisterClass("OpenGL",*hInstance))
	){
		MessageBox(NULL,"Error",__FUNCTION__,MB_OK | MB_ICONINFORMATION);
		*hDC=NULL;
	}
}

LRESULT CALLBACK WndProc(HWND hWnd,UINT uMsg,WPARAM wParam,LPARAM lParam){
	switch (uMsg){
		case WM_ACTIVATE:{
			active=!HIWORD(wParam);
			return 0;
		}
		case WM_SYSCOMMAND:{
			switch (wParam){
				case SC_SCREENSAVE:return 0;
				case SC_MONITORPOWER:return 0;
			}
			break;
		}
		case WM_CLOSE:
			PostQuitMessage(0);
			return 0;
		case WM_KEYDOWN:
			keys[wParam] = 1;
			return 0;
		case WM_KEYUP:
			keys[wParam] = 0;
			return 0;
		case WM_SIZE:
			GlSetSize(LOWORD(lParam),HIWORD(lParam));  
			return 0;
	}
	return DefWindowProc(hWnd,uMsg,wParam,lParam);
}

int CreateGLWindow(HINSTANCE*hInstance,HDC*hDC,HGLRC*hRC,HWND*hWnd,char* title, long width, long height, int bits, int fullscreen, int dblbuf){
	if(!RegisterClass(&(WNDCLASS){CS_HREDRAW | CS_VREDRAW | CS_OWNDC,(WNDPROC) WndProc, 0,0,*hInstance=GetModuleHandle(NULL),.hCursor=LoadCursor(NULL,IDC_ARROW),.lpszClassName="OpenGL"}))
		return MessageBox(NULL,"Failed To Register The Window Class.",__FUNCTION__,MB_OK|MB_ICONEXCLAMATION),1;
	
	if(fullscreen && !ChangeDisplaySettings(&(DEVMODE){.dmSize=sizeof(DEVMODE),.dmPelsWidth=width,.dmPelsHeight=height,.dmBitsPerPel=bits,.dmFields=DM_BITSPERPEL|DM_PELSWIDTH|DM_PELSHEIGHT},CDS_FULLSCREEN))
		ShowCursor(0);
	else
		fullscreen=0;
	
	DWORD dwExStyle=fullscreen?WS_EX_APPWINDOW:WS_EX_APPWINDOW|WS_EX_WINDOWEDGE;
	DWORD   dwStyle=fullscreen?WS_POPUP:WS_OVERLAPPEDWINDOW;
	RECT rect={.left=0,.right=width,.top=0,.bottom=height};
	AdjustWindowRectEx(&rect, dwStyle, 0, dwExStyle);
	PIXELFORMATDESCRIPTOR pfd={sizeof(PIXELFORMATDESCRIPTOR),1, PFD_DRAW_TO_WINDOW | PFD_SUPPORT_OPENGL| (dblbuf?PFD_DOUBLEBUFFER:0), PFD_TYPE_RGBA, bits, .cDepthBits=16,.iLayerType=PFD_MAIN_PLANE};
	if(!(*hWnd=CreateWindowEx(dwExStyle,"OpenGL",title,dwStyle |WS_CLIPSIBLINGS |WS_CLIPCHILDREN,0, 0,rect.right-rect.left,rect.bottom-rect.top,NULL,NULL,*hInstance,NULL))
	 ||!(*hDC=GetDC(*hWnd))
	 ||!(SetPixelFormat(*hDC,ChoosePixelFormat(*hDC,&pfd),&pfd))
	 ||!(*hRC=wglCreateContext(*hDC))
	 ||!(wglMakeCurrent(*hDC,*hRC))
	)return -1;

	if(strstr(glGetString(GL_EXTENSIONS),"WGL_EXT_swap_control"))
		(*(wglGetProcAddress("wglSwapIntervalEXT")))(1);
	ShowWindow(*hWnd,SW_SHOW);
	SetForegroundWindow(*hWnd);
	SetFocus(*hWnd);
	GlSetSize(width, height);
	GlInit();
	return 0;
}

int WINAPI WinMain(HINSTANCE hInstance_,HINSTANCE hPrevInstance,LPSTR lpCmdLine,int nCmdShow){
	unsigned alive=1,fullscreen=0,width=640,height=480,bpp=8,dblbuf=1;
	HDC hDC;
	HGLRC hRC;
	HWND hWnd;
	HINSTANCE	hInstance;
	
	while(alive){
		if (!CreateGLWindow(&hInstance,&hDC,&hRC,&hWnd,"Eldorado",width,height,bpp,fullscreen,dblbuf)){
			while(1){
				MSG msg;
				if (PeekMessage(&msg,NULL,0,0,PM_REMOVE)){
					if (msg.message==WM_QUIT){
						alive=0;
						break;//to quit
					}
					TranslateMessage(&msg);
					DispatchMessage(&msg);
				}else{
					GlInput();
					GlDraw();
					if (keys[VK_ESCAPE]){
						alive=0;
						break;//because of error/escape
					}
					SwapBuffers(hDC);
					if (keys[VK_F1])
						break;//to reload the window
				}
			}
		}
		KillGLWindow(&hInstance,&hDC,&hRC,&hWnd,fullscreen);
		if (keys[VK_F1]){
			keys[VK_F1]=0;
			fullscreen=!fullscreen;
		}
	}
	return 0;
}
