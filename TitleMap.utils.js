TitleMap.prototype.replaceAll=function(from,to){
	this.map.forEach(function(m,i){if(m==from)this.set(i,to)},this);
}
TitleMap.prototype.discriminate=function(threshold,replacer){
	this.titles_occur.forEach(function(t,i){
		if(t<=threshold)this.replaceAll(i,replacer||0)},this)
}
