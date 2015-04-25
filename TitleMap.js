TitleMap=function(){
	this.titles=[/*U8Cl[1024],U8Cl[1024],...*/];
	this.map=[/*0,1,1,2...*/];
	this.size/*16*/;
	this.width;/*sprite par row*/
	this.limit;// last non-crossable sprites index
	this.view=document.getElementById('view');
	this.view_ctx=this.view.getContext('2d');
}
TitleMap.prototype.view2TitlesMap=function(tmp_titles,mirror){
	function equal_base(a,b,width){
		for(var i=0;i<a.data.length;i++)
			if(a.data[i]!=b.data[i])return false;
		return true;
	}
	function equal_flip(a,b,width){
		for(var y=0;y<a.data.length;y+=width)
			for(var x=0;x<width;x+=4)
				for(var i=0;i<4;i++)
					if(a.data[(y+(width-1-x))*4+i]!=b.data[(y+x)*4+i])return false;
		return true;
	}
	function equal_mirror(a,b,width){
		if(equal_base(a,b,width))return 1;
		if(equal_flip(a,b,width))return -1;
		return 0;
	}
	var equal=mirror?equal_mirror:equal_base;
	this.titles=[];//unique titles
	this.titles_occur=[];//unique titles occurrences
	this.map=tmp_titles.map(function(title){
		for(var t=0,uv=0;t<this.titles.length;t++)//search for an existing title
			if(uv=equal(this.titles[t],title,this.size)){//duplicate found ?
				this.titles_occur[t]++;
				return t;//yes : use it index
			}
		this.titles_occur.push(1);
		return this.titles.push(title)-1;//none found, add to the list
	},this);
	return this;
}
TitleMap.prototype.set=function(pos,val){
	var x=(pos*this.size)%this.view.width;
	var y=(((pos*this.size)-x)/this.view.width)*this.size
	this.view_ctx.putImageData(this.titles[val],x,y);
	this.map[pos]=val;
}
TitleMap.prototype.fromImageFile=function(size,img_f,cb){
	var self=this;
	var reader=new FileReader();
	reader.onload=function(){//file loaded
		var img=new Image();
		img.onload=function(){//image decoded
			self.fromImageData(size,this)
			if(cb)cb.call(self);
		}
		img.src=this.result;
	}
	reader.readAsDataURL(img_f);
}
TitleMap.prototype.fromImageData=function(size,img_d,cb){
	this.size=size;
	this.width=img_d.width/size;
	this.view.width=img_d.width;
	this.view.height=img_d.height;
	this.view_ctx.drawImage(img_d,0,0);
	
	for(var y=0,tmp=[];y<this.view.height;y+=size)
		for(var x=0;x<this.view.width;x+=size)
			tmp.push(this.view_ctx.getImageData(x,y,size,size));
			
	this.view2TitlesMap(tmp,false);//remove duplicate titles
}
TitleMap.prototype.fromFiles=function(info_f,map_f,ttl_f,cb){
	var self=this;
	var reader=new FileReader();
	reader.onload=function(){//json loaded
		var info=JSON.parse(this.result);
		self.size=+info.size;
		self.width=+info.width;
		self.limit=+info.limit||0;
		reader.onload=function(){//map loaded
			self.map=Array.prototype.slice.call(new window['Uint'+info.mapType+'Array'](this.result));
			reader.onload=function(){//sprites loaded
				var titles=new Uint8ClampedArray(this.result),ttlsize=self.size*self.size*4;
				for(var i=0;i<titles.length;i+=ttlsize)
					self.titles.push(new ImageData(titles.subarray(i,i+ttlsize),self.size,self.size))
				self.view.width=self.size*self.width;
				self.view.height=self.size*(self.map.length/self.width);
				self.titles_occur=[];
				for(var y=0,i=0;y<self.map.length/self.width;y++)
					for(var x=0;x<self.width;x++){
						if(!self.titles_occur[i])self.titles_occur[i]=0;
						self.titles_occur[i]++;
						self.view_ctx.putImageData(self.titles[self.map[i++]],x*self.size,y*self.size);
					}
				if(cb)cb.call(self)
			}
			reader.readAsArrayBuffer(ttl_f);
		}
		reader.readAsArrayBuffer(map_f);
	}
	reader.readAsText(info_f);
}
TitleMap.prototype.toHref=function(ttl_a,map_a,info_a){
	for(var i=0;i<arguments.length;i++)//free all .href
		if(arguments[i].constructor==HTMLAnchorElement && arguments[i].hasAttribute('href'))
			URL.revokeObjectURL(arguments[i].href),
			arguments[i].removeAttribute('href');
	if(!this.map||!this.map.length)return;
	//titles
	var cnv=document.createElement('canvas')
	cnv.width=this.size
	cnv.height=this.size*this.titles.length
	var ctx=cnv.getContext('2d');
	this.titles.forEach(function(title,i){ctx.putImageData(title,0,i*this.size)},this)
	var blob=new Blob([ctx.getImageData(0,0,cnv.width,cnv.height).data])
	ttl_a.href=window.URL.createObjectURL(blob)
	ttl_a.title='nb:'+this.titles.length+'='+blob.size/1024+'KB';
	//map
	var mapType=1<<Math.max(3,Math.ceil(Math.log2(Math.log2(this.titles.length))));
	map_a.href=window.URL.createObjectURL(new Blob([new window['Uint'+mapType+'Array'](this.map)]))
	map_a.title='nb:'+this.map.length+'(u'+mapType+') = '+(this.map.length*mapType/8)/1024+'Kb';
	//info
	info_a.href=window.URL.createObjectURL(new Blob([JSON.stringify({
		mapType:mapType,size:this.size,width:this.width,limit:this.limit
	})]))
}