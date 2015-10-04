GLfloat	xpos=-1.;
GLfloat	ypos=-1.;

GLuint texture[1];

void GlSetSize(GLsizei width, GLsizei height){
	if (height==0)
		height=1;
	glViewport(0,0,width,height);
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	glOrtho(-1.f, 1.f, -1.f, 1.f, -1.f, 1.f);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
}

void GlTexturesLoad(int index,const char*path,int width,int height){
	unsigned data[width*height];
	FILE*f=fopen(path,"rb+");
	fread(data,4*width*height,1,f);
	fclose(f);
	
	glGenTextures(1, &texture[index]);
	glBindTexture(GL_TEXTURE_2D, texture[index]);
	glTexImage2D(GL_TEXTURE_2D, 0, 3, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_NEAREST);
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MAG_FILTER,GL_NEAREST);
}

void GlInit(){
	GlTexturesLoad(0,"zelda.ttl",16,16*32);
	GlTexturesLoad(1,"font.4.465.raw",4,5*93);
	glEnable(GL_TEXTURE_2D);
	glClear(GL_DEPTH_BUFFER_BIT);
}

void GlInput(){
	if(keys[VK_UP]||keys[VK_DOWN]||keys[VK_LEFT]||keys[VK_RIGHT]){
		GLint viewport[4];
		glGetIntegerv(GL_VIEWPORT,viewport);
		//move by 1px per frame
		if(keys[VK_UP   ])ypos-=1.f/viewport[3];
		if(keys[VK_DOWN ])ypos+=1.f/viewport[3];
		if(keys[VK_LEFT ])xpos+=1.f/viewport[2];
		if(keys[VK_RIGHT])xpos-=1.f/viewport[2];
	}
}

GLvoid glPrintf(float x,float y,const char *fmt, ...){
	if (!fmt)return;
	char text[256];
	va_list ap;
	va_start(ap, fmt);
	vsnprintf(text, sizeof(text), fmt, ap);
	va_end(ap);

	glBegin(GL_QUADS);
	glBindTexture(GL_TEXTURE_2D, texture[1]);
	glTexCoord2f(0.,0.);glVertex3f(0.,.5,.0);
	glTexCoord2f(1.,0.);glVertex3f(.5,.5,.0);
	glTexCoord2f(1.,.5);glVertex3f(.5,.0,.0);
	glTexCoord2f(0.,.5);glVertex3f(.0,.0,.0);
	glEnd();
}

void GlDraw(){
	GLint size[4];
	glGetIntegerv(GL_VIEWPORT,size);
	glBindTexture(GL_TEXTURE_2D, texture[0]);
	glGetTexLevelParameteriv(GL_TEXTURE_2D,0,GL_TEXTURE_WIDTH,&(size[0]));
	glBegin(GL_QUADS);
	float width =2.f*(size[0]/(float)size[2]);
	float height=2.f*(size[0]/(float)size[3]);
	float n=0;
	for(float x=xpos;x<1.1;x+=width){
		for(float y=ypos;y<1.1;y+=height){
			glTexCoord2f(0.,n       );glVertex3f(x      ,y+height,.0);
			glTexCoord2f(1.,n       );glVertex3f(x+width,y+height,.0);
			glTexCoord2f(1.,n+1./32.);glVertex3f(x+width,y       ,.0);
			glTexCoord2f(0.,n+1./32.);glVertex3f(x      ,y       ,.0);
			n+=1./32.;
		}
	}
	glEnd();
	glPrintf(0,0,"test:%i",42);
}
