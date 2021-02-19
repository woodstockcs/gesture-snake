/* eslint-disable no-undef */

class Snake {
  constructor(headImg, tailImg) {
    this.len = 0;
    this.headImg = headImg;
    this.tailImg = tailImg;
    this.body = [];
    this.body[0] = createVector(0, 0);
    this.xdir = 0;
    this.ydir = 0;
    this.tailImgList = [];
  }

  setDir(x, y) {
    this.xdir = x;
    this.ydir = y;
  }

  update() {
    let head = this.body[this.body.length - 1].copy();
    this.body.shift();
    head.x += this.xdir / 8;
    head.y += this.ydir / 8;
    this.body.push(head);
  }

  grow() {
    
    let head = this.body[this.body.length-1].copy();
    this.len++;
    this.body.push(head);
    let newImg = this.tailImg;
    //newImg.hide();
    this.tailImgList.push(newImg);
    // let head = this.body[this.body.length - 1].copy();
    // this.len++;
    // this.body.push(head);
  }

  endGame() {
    let x = this.body[this.body.length - 1].x;
    let y = this.body[this.body.length - 1].y;
    if (x > w - 1 || x < 0 || y > h - 1 || y < 0) {
      return true;
    }
    for (let i = 0; i < this.body.length - 1; i++) {
      let part = this.body[i];
      if (part.x == x && part.y == y) {
        return true;
      }
    }
    return false;
  }

  eat(pos) {
    let x = this.body[this.body.length - 1].x;
    let y = this.body[this.body.length - 1].y;
    if (x == pos.x && y == pos.y) {
      this.grow();
      print("FOOD EATEN");
      return true;
    }
    return false;
  }

  show() {
    // show head  
    let headIndex = this.body.length - 1;
    this.headImg.position(
      this.body[headIndex].x * rez,
      this.body[headIndex].y * rez
    );
    this.headImg.show();
    // show tail
    for (let i = 0; i < this.body.length - 1; i++) {
      //this.tailImgList[i].position(this.body[i].x * rez, this.body[i].y * rez);
      //this.tailImgList[i].show();
      image(this.tailImgList[i], this.body[i].x * rez, this.body[i].y * rez);
      fill(0);
      rect(this.body[i].x, this.body[i].y, 0.5, 0.5);
    }
  }

  getScore() {
    return this.body.length - 1;
  }
}
