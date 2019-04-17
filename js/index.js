(function () {
    //模拟数据


    let date = localStorage.getItem('mList') ?
        JSON.parse(localStorage.getItem('mList')) : [];
    console.log(date);
    let searchData = [];

    //获取元素
    let start = document.querySelector('.start');
    let next = document.querySelector('.next');
    let prev = document.querySelector('.prev');
    let audio = document.querySelector('audio');
    let nowTimeSpan = document.querySelector('.nowTime');
    let totalTimeSpan = document.querySelector('.totalTime');
    let songSinger = document.querySelector('.ctrl-bars-box span');
    let logoImg = document.querySelector('.logo img');
    let ctrlBars = document.querySelector('.ctrl-bars');
    let noBars = document.querySelector('.nobars');
    let ctrlBtn = document.querySelector('.ctrl-btn');
    let listBox = document.querySelector('.play-list-box ul');
    let mode = document.querySelector('footer .mode')
    let infos = document.querySelector('.info')

    //给audio设置播放路径


    //变量
    let index = 0;  //标识当前播放歌曲索引
    let rotateDeg = 0;//记录专辑封面旋转角度
    let timer = null; //保存定时器
    let modeNum = 0; // 播放模式 0列表循环 1单曲循环 2随机播放


    //加载播放列表
    function loadPlayList() {
        if (date.length) {
            let str = ''; //用来累计播放项
            //加载播放列表
            for (let i = 0; i < date.length; i++) {
                str += '<li>';
                str += '<i>×</i>';
                str += '<span>' + date[i].name + ' </span>';
                str += '<span>';
                for (let j = 0; j < date[i].ar.length; j++) {
                    str += date[i].ar[j].name + ' ';
                }
                str += '</span>';
                str += '</li>';
            }
            listBox.innerHTML = str;

        }
    }
    loadPlayList();

    //请求服务器
    $('.search').on('keydown', function (e) {
        if (e.keyCode === 13) {
            //按下回车键
            $.ajax({
                //服务器地址
                url: 'https://api.imjad.cn/cloudmusic/',
                //参数
                data: {
                    type: 'search',
                    s: this.value
                },
                success: function (data) {
                    searchData = data.result.songs;
                    var str = '';
                    for (var i = 0; i < searchData.length; i++) {
                        str += '<li>';
                        str += ' <span class=" left song">' + searchData[i].name + '</span>';
                        str += '<span class=" right singer">';
                        for (var j = 0; j < searchData[i].ar.length; j++) {
                            str += searchData[i].ar[j].name + '';
                        }
                        str += '</span>';
                        str += ' </li>';
                    }
                    $('.searchUl').html(str);
                },
                crror: function (err) {
                    console.log(err);

                }
            })
            this.value = '';
        }

    })
    //点击搜索列表
    $('.searchUl').on('click', 'li', function () {
        date.push(searchData[$(this).index()]);
        localStorage.setItem('mList', JSON.stringify(date));
        loadPlayList();
        index = date.length - 1;
        init();
        play();
    });

    //切换播放列表
    function checkPlayList() {
        if (date.length) {
            let playList = document.querySelectorAll('.play-list-box ul li');
            for (let i = 0; i < playList.length; i++) {
                playList[i].className = '';
            }
            playList[index].className = 'active';
        }
    }

    //加载播放歌曲的数量
    function loadNum() {
        $('.play-list').html(date.length);

    }

    loadNum();

    //格式化时间
    function formatTime(time) {
        return time > 9 ? time : '0' + time;

    }

    //播放模式提示栏
    function info(str) {
        infos.innerHTML = str;
        infos.style.display = 'block';
        setTimeout(function () {
            infos.style.display = 'none';
        }, 2000)
    }

    //点击播放列表
    $(listBox).on('click', 'li', function () {
        index = $(this).index();
        init();
        play();
    })
    //删除
    $(listBox).on('click', 'i', function () {
        date.splice($(this).parent().index(), 1);
        localStorage.setItem('mList', JSON.stringify(date));
        loadPlayList();
        e.stopPropagation()
    })

    //初始化播放
    function init() {
        if (date.length) {
            //给audio设置播放路径
            rotateDeg = 0;
            checkPlayList();
            $('.mask').css({
                background: 'url("' + date[index].al.picUrl + '")',
                BackgroundSize: '100%',
            })
            audio.src = 'http://music.163.com/song/media/outer/url?id=' + date[index].id + '.mp3';
            let str = '';
            str = date[index].name + '---';
            for (let i = 0; i < date[index].ar.length; i++) {
                str += date[index].ar[i].name + '  ';
            }
            songSinger.innerHTML = str;

            logoImg.src = date[index].pic;
        }
    }

    init();

    // 去不重复的随机数
    function getRandomNum() {
        let randomNum = Math.floor(Math.random() * date.length);
        if (randomNum === index) {
            randomNum = getRandomNum();
        }
        return randomNum;
    }

    //播放音乐
    function play() {
        audio.play();
        clearInterval(timer);
        timer = setInterval(function () {
            rotateDeg++;
            logoImg.style.transform = 'rotate(' + rotateDeg + 'deg)';
        }, 40);
        start.style.backgroundPositionY = '-165px';
    }


    //播放和暂停
    start.addEventListener('click', function () {
        //检测歌曲是播放还是暂停
        if (audio.paused) {
            play();
        } else {
            audio.pause();
            clearInterval(timer);
            start.style.backgroundPositionY = '-204px';
        }
    });
    //下一曲
    next.addEventListener('click', function () {
        index++;
        index = index > date.length - 1 ? 0 : index;
        init()
        play();
    });
    //上一曲
    prev.addEventListener('click', function () {
        index--;
        index = index < 0 ? date.length - 1 : index;
        init()
        play();
    })
    //切换播放模式
    //时间
    audio.addEventListener('canplay', function () {
        let totalTime = audio.duration;
        let totalM = parseInt(totalTime / 60);
        let totalS = parseInt(totalTime % 60);
        totalTimeSpan.innerHTML = formatTime(totalM) + ':' + formatTime(totalS);

        audio.addEventListener('timeupdate', function () {
            let currentTime = audio.currentTime;
            let currentM = parseInt(currentTime / 60);
            let currentS = parseInt(currentTime % 60);
            nowTimeSpan.innerHTML = formatTime(currentM) + ':' + formatTime(currentS);

            let barWidth = ctrlBars.clientWidth;
            let position = currentTime / totalTime * barWidth;
            noBars.style.width = position + 'px';
            ctrlBtn.style.left = position - 5 + 'px';

            if (audio.ended) {
                switch (modeNum) {
                    case 0:
                        let e = document.createEvent("MouseEvents");
                        e.initEvent("click", true, true);
                        next.dispatchEvent(e);
                        break;
                    case 1:
                        init();
                        play();
                        break;
                    case 2:
                        // 取随机数
                        index = getRandomNum();
                        init();
                        play();
                        break;
                }

            }

        })
    });
    mode.addEventListener('click', function () {
        modeNum++;
        modeNum = modeNum > 2 ? 0 : modeNum;
        switch (modeNum) {
            case 0:
                info('顺序播放');
                mode.style.backgroundPositionY = '-338px';
                break;
            case 1:
                info('单曲播放');
                mode.style.backgroundPositionX = '-63px';
                break;
            case 2:
                info('随机播放');
                mode.style.backgroundPositionY = '-243px';
        }
    })
    ctrlBars.addEventListener('click', function (e) {
        audio.currentTime = e.offsetX / ctrlBars.clientWidth * audio.duration;

    })
})();