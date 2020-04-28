function Class() {
  public:this.a = 1;
  this.b = 2;

  private:var x = 1;
  var y = 2;
}

var a = 1;
test1: if (true) {
  while (a < 100) {
    if (a == 6) break test1;
    console.log(a); 
    a++;
  }
}


