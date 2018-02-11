var tbl;   //表示页面中的table，表示将要显示游戏的主面板
var preTbl;  //表示预览面板
var status = 0;  //游戏状态，未开始：0，开始：1，结束：2
var timer;  //定时器，在定时器内做moveDown操作
var score = 0;  //分数
//board是一个20*12的数组,和页面table相对应
//标注哪些方格被占据，初始都为0，占据为1
var board = new Array(20);  
for (var i = 0; i < 20; i ++){
	board[i] = new Array(12);
}
for(var i = 0;i < 20;i ++){
	for(var j = 0;j < 12;j ++){
		board[i][j] = 0;
	}
}

var activeBlock;  //当前活动的方块，可以左右移动，变形。触底后，更新board
var nextBlock;  //下一个图形
var previewBlock;  //下一个图形预览
//产生七种基本图形
function generateBlock(){
	var block = new Array(4);
	//产生0-6随机数字，表示七种图形
	var t = Math.round(Math.random()*6);
	switch(t){
		case 0:{      
            block[0] = {x:0, y:4};      
            block[1] = {x:1, y:4};      
            block[2] = {x:0, y:5};      
            block[3] = {x:1, y:5};      
            break;      
        }      
        case 1:{      
            block[0] = {x:0, y:3};      
            block[1] = {x:0, y:4};      
            block[2] = {x:0, y:5};      
            block[3] = {x:0, y:6};      
            break;      
        }      
        case 2:{      
            block[0] = {x:0, y:5};      
            block[1] = {x:1, y:4};      
            block[2] = {x:1, y:5};      
            block[3] = {x:2, y:4};      
            break;      
        }      
        case 3:{      
            block[0] = {x:0, y:4};      
            block[1] = {x:1, y:4};      
            block[2] = {x:1, y:5};      
            block[3] = {x:2, y:5};      
            break;      
        }      
        case 4:{      
            block[0] = {x:0, y:4};      
            block[1] = {x:1, y:4};      
            block[2] = {x:1, y:5};      
            block[3] = {x:1, y:6};      
            break;      
        }      
        case 5:{      
            block[0] = {x:0, y:4};      
            block[1] = {x:1, y:4};      
            block[2] = {x:2, y:4};      
            block[3] = {x:2, y:5};      
            break;      
        }      
        case 6:{      
            block[0] = {x:0, y:5};      
            block[1] = {x:1, y:4};      
            block[2] = {x:1, y:5};      
            block[3] = {x:1, y:6};      
            break;
		}
	}
	return block;
}

//向下移动
function moveDown(){
	//检查是否触底
	if(checkBottomBorder()){   
		erase();   //没有触底，擦除当前图形
		//更新当前图形坐标
		for(var i = 0;i < 4;i ++){
			activeBlock[i].x = activeBlock[i].x + 1;
		}
		paint();   //重画当前图形
	}
	//触底
	else{
		clearInterval(timer);   //停止当前定时器，停止自动向下移动
		updateBoard();   //更新Board数组
		//消行
		var lines = deleteLine();
		//如果有行消
		if(lines != 0){
			//一次消多行则分数加倍
			if(lines == 2){
				lines = 3;
			}
			if(lines == 3){
				lines = 6;
			}
			if(lines == 4){
				lines = 10;
			}
			score = score + lines;
			updateScore();   //更新分数
			eraseBoard();   //擦除整个面板
			paintBoard();   //重绘整个面板
		}
		erasePreview();   //擦除当前预览
		//产生一个新图形并判断是否可以放在最初位置
		if(!validateBlock(nextBlock)){
			alert("游戏结束！");
			status = 2;
			return;
		};
		activeBlock = nextBlock;
		nextBlock = generateBlock();
		previewBlock = copyBlock(nextBlock);
		paint();    //重画当前图形
		applyPreview();    //调整previewBlock的坐标以适应预览窗口
		paintPreview();    //绘预览图形
		timer = setInterval(moveDown,1000);  //定时器，每隔一个秒执行一次moveDown
	}
}
//向右移动
function moveRight(){
	if(checkRightBorder()){
		erase();
		//更新当前图形坐标
		for(var i = 0;i < 4;i ++){
			activeBlock[i].y = activeBlock[i].y + 1;
		}
		//重画图形
		paint();
	}
}
//向左移动
function moveLeft(){
	if(checkLeftBorder()){
		erase();
		for(var i = 0;i < 4;i ++){
			activeBlock[i].y = activeBlock[i].y - 1;
		}
		paint();
	}
}


//旋转, 因为旋转之后可能会有方格覆盖已有的方格.     
//先用一个tmpBlock,把activeBlock的内容都拷贝到tmpBlock,     
//对tmpBlock尝试旋转, 如果旋转后检测发现没有方格产生冲突,则     
//把旋转后的tmpBlock的值给activeBlock.     
function rotate(){      
    var tmpBlock = copyBlock(activeBlock);     
    //先算四个点的中心点，则这四个点围绕中心旋转90度。    
    var cx = Math.round((tmpBlock[0].x + tmpBlock[1].x + tmpBlock[2].x + tmpBlock[3].x)/4);      
    var cy = Math.round((tmpBlock[0].y + tmpBlock[1].y + tmpBlock[2].y + tmpBlock[3].y)/4);      
    //旋转的主要算法. 可以这样分解来理解。    
    //先假设围绕源点旋转。然后再加上中心点的坐标。    

    for(var i=0; i<4; i++){      
        tmpBlock[i].x = cx+cy-activeBlock[i].y;     
        tmpBlock[i].y = cy-cx+activeBlock[i].x;     
    }      
    //检查旋转后方格是否合法.     
    for(var i=0; i<4; i++){      
        if(!isCellValid(tmpBlock[i].x,tmpBlock[i].y)){     
            return;     
        }     
    }     
    //如果合法, 擦除     
    erase();      
    //对activeBlock重新赋值.     
    for(var i=0; i<4; i++){      
        activeBlock[i].x = tmpBlock[i].x;      
        activeBlock[i].y = tmpBlock[i].y;      
    }     
    //重画.     
    paint();      
} 


//检查右边界
function checkRightBorder(){
	for(var i = 0;i < activeBlock.length;i ++){
		if(activeBlock[i].y == 11){
			return false;
		}
		if(!isCellValid(activeBlock[i].x,activeBlock[i].y + 1)){
			return false;
		}
	}
	return true;
}
//检查左边界
function checkLeftBorder(){
	for(var i = 0;i < activeBlock.length;i ++){
		if(activeBlock[i].y == 0){
			return false;
		}
		if(!isCellValid(activeBlock[i].x,activeBlock[i].y - 1)){
			return false;
		}
	}
	return true;
}

//检查底边界
function checkBottomBorder(){
	for(var i = 0;i < activeBlock.length;i ++){
		if(activeBlock[i].x == 19){
			return false;
		}
		if(!isCellValid(activeBlock[i].x + 1, activeBlock[i].y)){
			return false;
		}
	}
	return true;
}
//检查坐标(x,y)是否在board中已经存在
function isCellValid(x,y){
	if(y>11||y<0||x>19||x<0){
		//alert("aaa");
		return false;
	}
	if(board[x][y] == 1){
		return false;
	}
	return true;
}
//擦除当前活动图形
function erase(){
	for(var i = 0;i < 4;i ++){
		tbl.rows[activeBlock[i].x].cells[activeBlock[i].y].style.backgroundColor = "black";
	}
}
//重绘活动图形
function paint(){
	for(var i = 0;i < 4;i ++){
		tbl.rows[activeBlock[i].x].cells[activeBlock[i].y].style.backgroundColor="red";
	}
}
//更新board数组
function updateBoard(){
	for(var i = 0;i < 4;i ++){
		board[activeBlock[i].x][activeBlock[i].y] = 1;
	}
}
//消行
function deleteLine(){
	var lines = 0;
	for(var i = 0;i < 20;i ++){
		var j = 0;
		for(;j <12;j ++){
			if(board[i][j] == 0){
				//alert("0000");
				break;
			}
		}
		if(j==12){
			//alert("1111");
			lines ++;
			if(i != 0){
				for(var k = i-1;k >= 0;k --){
					board[k+1] = board[k];	
				}
			}
			board[0] = generateBlankLine();   //产生一个空白行
		}
	}
	return lines;
}
//更新分数
function updateScore(){
	document.getElementById("score").innerHTML = " " + score;
}
//擦除整个面板
function eraseBoard() {
	for(var i = 0;i < 20;i ++){
		for(var j = 0;j < 12;j ++){
			tbl.rows[i].cells[j].style.backgroundColor = "black";
		}
	}
}
//重绘整个面板
function paintBoard(){
	for(var i = 0;i < 20;i ++){
		for(var j = 0;j < 12;j ++){
			if(board[i][j] == 1){
				tbl.rows[i].cells[j].style.backgroundColor = "red";
			}
		}
	}
}
//擦除当前预览图形
function erasePreview(){
	for(var i = 0;i < 4;i ++){
		preTbl.rows[previewBlock[i].x].cells[previewBlock[i].y].style.backgroundColor = "black";
	}
}
//检查产生一个新图形是否可以放在最初位置
function validateBlock(block){
	if(!block){
		return false;
	}
	for(var i = 0;i < 4;i ++){
		//检查坐标是否在board中已经存在
		if (!isCellValid(block[i].x,block[i].y)) {
			//alert("2222");
			return false;
		}
	}
	return true;
}
//复制一个图形
function copyBlock(block){
	var b = new Array(4);
	for(var i = 0;i < 4;i ++){
		b[i] = {x:0,y:0};
	}
	for(var i = 0;i < 4;i ++){
		b[i].x = block[i].x;
		b[i].y = block[i].y;
	}
	return b;
}
//调整previewBlock的坐标以适应预览窗口
function applyPreview(){
	var t = 100;
	for(var i = 0;i < 4;i ++){
		if(previewBlock[i].y < t){
			t = previewBlock[i].y;
		}
	}
	for(var i = 0;i < 4;i ++){
		previewBlock[i].y -= t;
	}
}
//绘预览图形
function paintPreview(){
	for(var i = 0;i < 4;i ++){
		preTbl.rows[previewBlock[i].x].cells[previewBlock[i].y].style.backgroundColor = "red";
	}
}
//产生一个空白行
function generateBlankLine(){
	var line = new Array(12);
	for(var i = 0;i < 12;i ++){
		line[i] = 0;
	}
	return line;
}
//键盘控制
function keyControl(){
	if(status != 1){
		return;
	}
	var code = event.keyCode;
	switch(code){
		case 37:{
			moveLeft();
			break;
		}
		case 38:{
			rotate();
			break;
		}
		case 39:{
			moveRight();
			break;
		}
		case 40:{
			moveDown();
			break;
		}
	}
}
//开始
function begin(e){
	e.disabled = true;
	status = 1;
	tbl = document.getElementById("board");
	preTbl = document.getElementById("preBoard");
	activeBlock = generateBlock();
	nextBlock = generateBlock();
	previewBlock = copyBlock(nextBlock);
	applyPreview();
	paint();
	paintPreview();
	timer = setInterval(moveDown,1000);
}
document.onkeydown = keyControl;