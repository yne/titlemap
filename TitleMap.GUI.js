//tools function
TitleMap.prototype.replaceAll=function(from,to){
	this.map.forEach(function(m,i){if(m==from)this.set(i,to)},this);
}
TitleMap.prototype.tools={
	click_replace:function(c){//left=select model title, right=title to replace
		self=this;
		c.onclick=function(e){self.cur_title=e.target.dataset.id;}
		c.oncontextmenu=(function(e){
			this.replaceAll(e.target.dataset.id,self.cur_title);
			e.target.hidden=true;
			return false;
		}).bind(this)
	},
	action_discriminate:function(){//remove barely used titles
		var threshold=prompt('replace with #'+this.cur_title+',titles used less than :')
		if(!threshold || !this.cur_title)return alert("cancelled");
		this.titles_occur.forEach(function(t,i){if(t<threshold)this.replaceAll(i,replacer||0)},this)
	},
	drag_disabled:function(c){
		c.draggable=false;
	},
	drag_move:function(c){
		c.draggable=true;
		c.ondragstart=function(e){e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('id',this.id)},
		c.ondragover =function(e){if(e.preventDefault)e.preventDefault();e.dataTransfer.dropEffect='move';},
		c.ondrop     =function(e){if(e.preventDefault)e.preventDefault();
			var from=+e.dataTransfer.getData('id').substr(6),to=+this.id.substr(6);
			if(from==to)return;
			self.replaceAll(to,from);
			//c.parentElement.insertBefore(document.getElementById(e.dataTransfer.getData('id')),c);
			c.hidden=true;
		}
	}
}

TitleMap.prototype.bindTools=function(){
	$$('[id^=menu_]>*').forEach(function(n){n.parentNode.removeChild(n)})
	$$('[id^=menu_]').forEach(function(n){
		var o=document.createElement('option');
		o.textContent=n.title;
		o.disabled=true;
		n.appendChild(o);
		n.selectedIndex=0})
	
	for(var f in this.tools){
		var o=document.createElement('option');
		var m=f.match(/(\w+)_(\w+)/);
		o.textContent=m[2];
		$('#menu_'+m[1]).appendChild(o);
	}
}
TitleMap.prototype.showTitles=function(){
	$$('#titles>*').forEach(function(n){n.parentNode.removeChild(n)})
	this.titles.forEach(function(img,i){
		var c=document.createElement('canvas')
		c.width=this.size
		c.height=this.size
		c.title=i+'*'+this.titles_occur[i];
		c.dataset.id=i;
		c.getContext('2d').putImageData(img,0,0);
		$('#titles').appendChild(c)
	},this);
	this.bindTools();
}