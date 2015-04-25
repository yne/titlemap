function md(x,y){
	if(ta.dataset.activ=='true')return;//mouse reenter
	ta.style.left=(x-x%P.size)+'px';
	ta.style.top=(y-y%P.size)+'px';
	ta.style.width=ta.style.height=0;
	ta.hidden=false;
	ta.innerHTML="";
	ta.dataset.activ=true;
	mm(x,y)
}
function mm(x,y){
	if(ta.dataset.activ!='true')return;
	ta.style.width =(((x+8)-(x+8)%P.size)-(ta.style.left.slice(0,-2)))+'px';
	ta.style.height=(((y+8)-(y+8)%P.size)-(ta.style.top .slice(0,-2)))+'px';
}
function mu(){
	if(ta.dataset.activ!='true')return;//already inactiv (form click?)
	ta.dataset.activ=false;
	[].slice.call(ta.children).forEach(function(ch){ta.removeChild(ch)});
	var offsetX=ta.style.left.slice(0,-2)/P.size;
	var offsetY=ta.style.top .slice(0,-2)/P.size;
	var width=P.view.width/P.size;
	//console.log(offsetX,offsetY,width)
	for(var y=0;y<ta.style.height.slice(0,-2)/P.size;y++)
		for(var x=0;x<ta.style.width.slice(0,-2)/P.size;x++){
			var input=document.createElement('input');
			input.style.width=input.style.height=P.size+'px';
			input.value=P.map[(y+offsetY)*width+((x+offsetX))];
			ta.appendChild(input)
		}
}
//onmousedown="md(event.pageX,event.pageY)" onmousemove="mm(event.pageX,event.pageY)" onmouseout="mm(event.pageX,event.pageY)" onmouseup="mu()"
//	<form style="margin:0;padding:0;" id="ta" onmousemove="mm(event.pageX,event.pageY)" onmouseup="mu()" onsubmit="console.log(this);this.hidden=true;return false;" hidden></form>
