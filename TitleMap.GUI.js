TitleMap.prototype.toGUI=function(){
	$('aside').hidden=true;
//	fileReader.readAsArrayBuffer(new Blob(this.titles));
};
var focus_title;
TitleMap.prototype.showTitles=function(){
	$$('#titles>*').forEach(function(n){n.parentNode.removeChild(n)})
	this.titles.forEach(function(img,i){
		var c=El('canvas',{width:this.size,height:this.size})
		c.title=i+'*'+this.titles_occur[i];
		c.dataset.id=i;
		c.onclick      =function(e){focus_title=e.target.dataset.id;}
		c.oncontextmenu=(function(e){
			this.replaceAll(e.target.dataset.id,focus_title);
			e.target.hidden=true;
			return false;
		}).bind(this)
		/*
		c.ondragstart=function(e){e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('id',this.id)},
		c.ondragover =function(e){if(e.preventDefault)e.preventDefault();e.dataTransfer.dropEffect='move';},
		c.ondrop     =function(e){if(e.preventDefault)e.preventDefault();
			var from=+e.dataTransfer.getData('id').substr(6),to=+this.id.substr(6);
			if(from==to)return;
			self.replaceAll(to,from);
			//c.parentElement.insertBefore(document.getElementById(e.dataTransfer.getData('id')),c);
			c.hidden=true;
		}
		c.draggable=true;
		*/
		c.getContext('2d').putImageData(img,0,0);
		$('#titles').appendChild(c)
	},this)
}