setInterval(update, 1000);

function update() {
  
  var clock = document.getElementById('timer');
  var calender = document.getElementById('calender');
  
  var current = new Date();
  var hour = current.getHours();
  var minute = current.getMinutes();
  var second = current.getSeconds();
  var month = current.getMonth()+1;
  var day = current.getDate();
  var week = current.getDay();
  var am_pm = '오전';

  if (hour >= 12) {
    am_pm = '오후';
    hour -= 12
  }

  clock.innerHTML = am_pm +' '+ zeros(hour) +":"+zeros(minute)+":"+zeros(second);
  
  if (week == 1) {
    wak = '월'
  }
  else if (week == 2) {
    wak = '화'
  }
  else if (week == 3) {
    wak = '수'
  }
  else if (week == 4) {
    wak = '목'
  }
  else if (week == 5) {
    wak = '금'
  }
  else if (week == 6) {
    wak = '토'
  }
  else if (week == 0) {
    wak = '일'
  }
  calender.innerHTML = month+"월 "+day+"일 "+ wak+"요일"
}

function zeros(num) {
  if (num < 10) {
    return '0'+num;
  }
  else {
    return num;
  }
}