let click = 0;
let draggedItem;

import chatArr from './chats';


class Icon extends Phaser.GameObjects.Image{
    constructor(scene:Scene, x:number, y:number, texture:string, highlight:Phaser.GameObjects.Rectangle, wnd){
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.setInteractive();
        this.setScale(0.25);

        highlight.setStrokeStyle(5, 0xFFFFFF);
        highlight.setVisible(false);

        this.on(Phaser.Input.Events.POINTER_DOWN, function() {
            click++;
            highlight.setPosition(x,y);
            highlight.setVisible(true);
            if(click >= 2){
                wnd.setVisible(true);
                wnd.parentContainer.bringToTop(wnd);
                for(let i = 0; i < wnd.parentContainer.getAll().length; i++){
                    if(i === wnd.parentContainer.getAll().length - 1){
                        let len = wnd.parentContainer.getAt(i).getAll().length;
                        wnd.parentContainer.getAt(i).getAt(len - 2).setVisible(false);
                    }else{
                        let len = wnd.parentContainer.getAt(i).getAll().length;
                        wnd.parentContainer.getAt(i).getAt(len - 2).setVisible(true); 
                    }
                }
                highlight.setVisible(false);
            }
            this.doubleClickTimer();
        }, this);
    }
    
    doubleClickTimer(){
        setTimeout(function(){
            click = 0;
        },700);
    }
}

class Wnd extends Phaser.GameObjects.Container{
    constructor(scene:Scene, x:number, y:number, title:string, content?:Phaser.GameObjects.Container){
        super(scene, x, y);
        scene.add.existing(this);
        let windBG = scene.add.image(0,0,'windBG');
        windBG.setInteractive();
        this.add(windBG);
        this.setScale(1.5);
        this.setVisible(false);
        this.setSize(windBG.width, windBG.height);

        let bar = scene.add.image(0,-200, 'bar');
        bar.setInteractive();
        this.add(bar);
        bar.on(Phaser.Input.Events.POINTER_DOWN, function(e){
            draggedItem = this;
        },this);

        let wndTitle = scene.add.text(-300, -215, title, { fontFamily: 'Helvetica', fontSize: '28px' });
        this.add(wndTitle);     
        
        
        if(content){
            content.setScale(0.6);
            content.x = -100;
            content.y = -3000;
            this.add(content);
        }

        let clickArea = new Phaser.GameObjects.Rectangle(scene,0,0, windBG.width, windBG.height, 0x707070,99);
        clickArea.setInteractive();
        this.add(clickArea);
        // clickArea.setVisible(false);
        clickArea.on(Phaser.Input.Events.POINTER_DOWN, function(){
            this.parentContainer.bringToTop(this);
            for(let i = 0; i < this.parentContainer.getAll().length; i++){
                if(i === this.parentContainer.getAll().length - 1){
                    let len = this.parentContainer.getAt(i).getAll().length;
                    this.parentContainer.getAt(i).getAt(len - 2).setVisible(false);
                }else{
                    let len = this.parentContainer.getAt(i).getAll().length;
                    this.parentContainer.getAt(i).getAt(len - 2).setVisible(true); 
                }
            }
        },this); 
        
        
        let close = scene.add.image(300,-200, 'close');
        close.setScale(0.1);
        this.add(close);
        close.setInteractive();
        close.on(Phaser.Input.Events.POINTER_DOWN, function(){
            this.setVisible(false);
        }, this);
    }
    zInd = 0;
}

class Bubble extends Phaser.GameObjects.Container{
    constructor(scene:Scene, x:number, y:number, texture:string, msg:string){
        super(scene, x, y);
        scene.add.existing(this);

        let msgX;
        let style;
        if(texture === 'left'){
            style = { fontFamily: 'Helvetica', fontSize: '40px', fill: 'white', align: 'left'};
            msgX = -180;
        }else{
            style = { fontFamily: 'Helvetica', fontSize: '40px', fill: 'black', align: 'left'};
            msgX = 0;
        }

        let chatMsg = new Phaser.GameObjects.Text(scene, msgX, 50, msg, style);
        let brokenStr = chatMsg.basicWordWrap(msg, chatMsg.context, 400);
        chatMsg.setText(brokenStr);
        chatMsg.setOrigin(0,0);
        let lines = brokenStr.split("\n").length;
        this.lines = lines;


        let top = scene.add.image(x,0,`${texture}-top`);
        top.setOrigin(0.5,0);
        this.add(top);

        for(let i = 0; i < lines + 1; i++){
            let middle = scene.add.image(x,40*i + 40,`${texture}-middle`);
            middle.setOrigin(0.5,0)
            this.add(middle);
        }

        let bottom = scene.add.image(x,40*lines + 80,`${texture}-bottom`);
        this.add(bottom);
        bottom.setOrigin(0.5,0);
        this.add(chatMsg);
    }
    lines = 1;
}

class Scene extends Phaser.Scene {
    preload(){
        this.load.image('hills', '../assets/grassy-hills.jpg');
        this.load.image('chat', '../assets/chat.png');
        this.load.image('folder', '../assets/folder.png');
        this.load.image('windBG', '../assets/window.png');
        this.load.image('close', '../assets/x.png');
        this.load.image('bar', '../assets/bar.png');
        this.load.image('left', '../assets/left-full.png');
        this.load.image('left-top', '../assets/left-top.png');
        this.load.image('left-middle', '../assets/left-middle.png');
        this.load.image('left-bottom', '../assets/left-bottom.png');
        this.load.image('right', '../assets/right-full.png');
        this.load.image('right-top', '../assets/right-top.png');
        this.load.image('right-middle', '../assets/right-middle.png');
        this.load.image('right-bottom', '../assets/right-bottom.png');
    }

    create(){
        let background = this.add.image(800,450,'hills');
        background.setScale(2);
        background.setInteractive();
        background.on(Phaser.Input.Events.POINTER_DOWN, function(){
            highlight.setVisible(false);
        }, this);

        let highlight:Phaser.GameObjects.Rectangle = this.add.rectangle(0, 0, 200, 200);

        let chatPos = 0;

        let chats = new Phaser.GameObjects.Container(this, 0,0);
        let prevY = 0;
        let length;
        for(let i = 0; i < chatArr.length; i++){
            let y = 250 *i + prevY;
            let x;
            let texture;
            if(chatArr[i].from === "you"){
                x = 200;
                texture = 'right';
            }else{
                x = 0;
                texture = 'left';
            }
            let chat = new Bubble(this,x, y, texture, chatArr[i].msg);
            prevY = chat.lines*20;
            chats.add(chat);
            length = chat.y;
        }

        let scrollArea = new Phaser.GameObjects.Rectangle(this, 150, chatPos, 1000, 2*length, 0xcfcfcf, 99.5);
        scrollArea.setInteractive();

        //@ts-ignore
        let shape = this.make.graphics().fillStyle(0).fillRect(20, 0, 850, 550);
        shape.x = 400;
        shape.y = 250;
        chats.add(scrollArea);
        chats.mask = new Phaser.Display.Masks.GeometryMask(this, shape);
        
        scrollArea.on('wheel', function(pointer){
            // if(
            //     !((chatPos/10 > scrollArea.y) && (pointer.deltaY < 0)) && 
            //     !((-chatPos < scrollArea.y) && (pointer.deltaY > 0))
            // ){
                let change = -pointer.deltaY*0.5;
                scrollArea.setY(scrollArea.y - change);
                chats.setY(chats.y + change);
            // }
        }, this)

        let windows = this.add.container(0,0);
        windows.setDepth(1);
        let chatWnd = new Wnd(this, 800, 500, "Chat With Me", chats);
        let folderWnd = new Wnd(this, 850, 450, "File Explorer");
        
        windows.add([chatWnd, folderWnd]);
        let chat:Icon = new Icon(this, 100, 100,'chat', highlight, chatWnd);
        let folder:Icon = new Icon(this, 100, 300, 'folder', highlight, folderWnd);

        this.input.on('pointermove', function(e){
            if(draggedItem){
                draggedItem.setPosition(draggedItem.x + e.position.x - e.prevPosition.x, draggedItem.y + e.position.y - e.prevPosition.y);
                shape.setPosition(shape.x + e.position.x - e.prevPosition.x, shape.y + e.position.y - e.prevPosition.y);
                scrollArea.setPosition(scrollArea.x + e.position.x - e.prevPosition.x, scrollArea.y + e.position.y - e.prevPosition.y);

                this.input.on(Phaser.Input.Events.POINTER_UP, function(){
                    draggedItem = null;
                }, this)
            }
        },this)
    }
}

window.addEventListener('load', (event) => {

    let config = {
        type: Phaser.AUTO,
        width: 1600,
        height: 900,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false
            }
        },
        scene: Scene
    };

    let game = new Phaser.Game(config);
});
