function setRoomMemberList(list)
{
    //清空房间成员列表
    resetRoomMemberList();
    var userId, avStatus, optText;
    if (list && list.length > 0) {

        for (var i = 0; i < list.length; i++)
        {
            userId = list[i];
            //过滤错误的用户ID
            if (userId && userId != '@TLS#NOT_FOUND') {
                //if (userId) {
                optText = userId;
                avStatus = qavSdk.GetEndpointAVMode(userId);
                //过滤没有音频和视频信号的用户
                if (avStatus == AVStatus.NONE) {
                    continue;
                }
                if (userId == loginInfo.identifier) {
                    optText += '(自己,';
                } else {
                    optText += '(';
                }
                switch (avStatus) {
                    case AVStatus.BOTH_AUDIO_AND_VIDEO:
                        optText += '麦克风打开,摄像头打开)';
                        break;
                    case AVStatus.ONLY_VIDEO:
                        optText += '麦克风关闭,摄像头打开)';
                        break;
                    case AVStatus.ONLY_AUDIO:
                        optText += '麦克风打开,摄像头关闭)';
                        break;
                    case AVStatus.NONE:
                        optText += '麦克风关闭,摄像头关闭)';
                        break;
                    default:
                        optText += '麦克风关闭,摄像头关闭)';
                        break;
                }
                $("#room_members_list")[0].options.add(new Option(optText, userId));
                if (!isMainUsable && userId == mainUserId) {
                    updateMemberVideoStatus(userId, mainUserLastVideoStatus, avStatus, 'mainViewVideoStatusLabel');
                    mainUserLastVideoStatus = avStatus;
                } else if (!isOther1Usable && userId == otherUserId1) {
                    updateMemberVideoStatus(userId, otherUserLastVideoStatus1, avStatus, 'other1ViewVideoStatusLabel');
                    otherUserLastVideoStatus1 = avStatus;
                } else if (!isOther2Usable && userId == otherUserId2) {
                    updateMemberVideoStatus(userId, otherUserLastVideoStatus2, avStatus, 'other2ViewVideoStatusLabel');
                    otherUserLastVideoStatus2 = avStatus;
                } else if (!isOther3Usable && userId == otherUserId3) {
                    updateMemberVideoStatus(userId, otherUserLastVideoStatus3, avStatus, 'other3ViewVideoStatusLabel');
                    otherUserLastVideoStatus3 = avStatus;
                }
            }
        }
    }
}

//更新已打开用户视频画面状态
function updateMemberVideoStatus(memberID, lastAvStatus, curAvStatus, viewStatusLabel) {
    log.info('memberID=' + memberID + ',lastAvStatus=' + lastAvStatus + ',curAvStatus=' + curAvStatus + ',viewStatusLabel=' + viewStatusLabel);
    //如果用户的上一次和当前的状态都是打开了摄像头，则无需任何操作
    if ((lastAvStatus == AVStatus.BOTH_AUDIO_AND_VIDEO || lastAvStatus == AVStatus.ONLY_VIDEO)
            &&
            (curAvStatus == AVStatus.BOTH_AUDIO_AND_VIDEO || curAvStatus == AVStatus.ONLY_VIDEO)) {
        return;
    }
    if (lastAvStatus != curAvStatus) {
        if (curAvStatus == AVStatus.BOTH_AUDIO_AND_VIDEO || curAvStatus == AVStatus.ONLY_VIDEO) {
            $('#' + viewStatusLabel).html('(摄像头打开)');
            if (memberID != loginInfo.identifier) {
                log.info('request view list again............');
                requestViewList(getCurOpenViewUserIds());
            }
        } else {
            $('#' + viewStatusLabel).html('(摄像头关闭)');
        }
    }
}

//清空房间成员下拉列表
function resetRoomMemberList() {
    $("#room_members_list").empty();
}

//加入房间
function enterRoom() {
    if (currentStatus < StatusType.context) {
        alert('加入房间失败：未创建上下文');
        return;
    }

    if (!validNumber($("#room_id").val())) {
        alert('房间号非法');
        return;
    }
    var room_id = parseInt($("#room_id").val());
    if (room_id == 0) {
        alert('房间号必须大于0');
        return;
    }
    if (room_id > 4294967295) {
        alert('房间号超出限制(最大为4294967295)');
        return;
    }

    if (currentStatus == StatusType.enter_room) {
        if (curentRoomId == room_id) {
            alert('您已加入该房间');
            return;
        } else {
            alert('您已加入一个房间(房间号：' + curentRoomId + '),如果想加入其他房间，请先退出当前房间.');
            return;
        }
    }

    inputRoomId = room_id;
    var room_type = 2;//房间类型， 多人音视频为2
    var relation_type = 6;//关系类型，多人房间专用，第三方App固定填6
    var relation_id = room_id;//关系Id，多人房间专用（房间号）
    //var mode = $('input[name="chat_type_radio"]:checked').val();
    var mode = 1;//视频通话模式，视频为1
    var auther = 0;//音视频权限bitmap，多人房间专用,暂时没有用到，默认我填0
    qavSdk.EnterRoom(room_type, relation_type, relation_id, mode, auther);
}

//取消成员视频画面
//userId是需要关闭画面的成员ID
function cancelView(userId) {
    log.info('start CancelView,userId=' + userId);
    var newUserIds = new Array;
    //先获取当前已打开视频的成员ID
    var list = getCurOpenViewUserIds();
    if (list.length == 0) {
        cancelAllView();
        return;
    }
    for (var i = 0; i < list.length; i++)
    {
        //剔除要关闭画面的成员ID
        if (list[i] != userId) {
            newUserIds.push(list[i]);
        }
    }
    //剔除要关闭的成员ID后，重新请求剩下的已打开视频的成员画面
    requestViewList(newUserIds);
    log.info('after CancelView');
}

//请求观看多位成员视频画面
function requestViewList(userIds) {
    log.info('start RequestViewList,userIds=' + userIds);
    if (!userIds || userIds.length == 0) {
        return;
    }
    qavSdk.requestViewList(userIds);
    log.info('after RequestViewList');
}

//取消所有成员视频画面
function cancelAllView() {
    log.info('start CancelAllView');
    qavSdk.CancelAllView();
    log.info('after CancelAllView');
}

//观看成员视频画面按钮点击事件
function checkview()
{
    if (currentStatus < StatusType.enter_room) {
        alert('打开画面失败：未加入房间');
        return;
    }
    var viewDiv;
    var width = OtherView.WIDTH;
    var height = OtherView.HEIGHT;
    var posx;
    var posy;
    var memberId = $("#room_members_list").val();
    if (memberId == null || memberId == undefined) {
        alert("选择的用户ID为空，请重新选择");
        return;
    }
    var avStatus = qavSdk.GetEndpointAVMode(memberId);
    if (avStatus == "undefined" || avStatus == AVStatus.NONE || avStatus == AVStatus.ONLY_AUDIO) {//没有音视频或只有音频
        alert("无法观看该用户视频画面(1、未插入或已关闭摄像头)，请选择其他用户进行观看");
        return;
    }
    if (memberId == mainUserId) {
        alert("已打开该用户视频画面(主视频画面)，请选择其他用户进行观看");
        return;
    }
    if (memberId == otherUserId1) {
        alert("已打开该用户视频画面(第1个其他视频画面)，请选择其他用户进行观看");
        return;
    }
    if (memberId == otherUserId2) {
        alert("已打开该用户视频画面(第2个其他视频画面)，请选择其他用户进行观看");
        return;
    }
    if (memberId == otherUserId3) {
        alert("已打开该用户视频画面(第3个其他视频画面)，请选择其他用户进行观看");
        return;
    }
    if (isMainUsable) {
        width = $('#win_width').val();
        height = $('#win_height').val();
        if (!validNumber(width)) {
            alert('主视频用户画面宽度非法');
            return;
        }
        if (!validNumber(height)) {
            alert('主视频用户画面高度非法');
            return;
        }
        if (width <= 0) {
            alert("画面宽度非法");
            return;
        }
        if (width > MainView.WIDTH) {
            alert("画面宽度过长(最大值" + MainView.WIDTH + ")");
            return;
        }
        if (height <= 0) {
            alert("画面高度非法");
            return;
        }
        if (height > MainView.HEIGHT) {
            alert("画面高度过长(最大值" + MainView.HEIGHT + ")");
            return;
        }
        width = parseInt(width);
        height = parseInt(height);
        viewDiv = 'mainView';
        mainUserId = memberId;
        $('#mainViewUserIdLabel').html(mainUserId);
        isMainUsable = false;
        mainUserLastVideoStatus = 1;
    } else if (isOther1Usable) {
        viewDiv = 'other1View';
        isOther1Usable = false;
        otherUserId1 = memberId;
        $('#other1ViewUserIdLabel').html(memberId);
        otherUserLastVideoStatus1 = 1;
    } else if (isOther2Usable) {
        viewDiv = 'other2View';
        isOther2Usable = false;
        otherUserId2 = memberId;
        $('#other2ViewUserIdLabel').html(memberId);
        otherUserLastVideoStatus2 = 1;
    } else if (isOther3Usable) {
        viewDiv = 'other3View';
        isOther3Usable = false;
        otherUserId3 = memberId;
        $('#other3ViewUserIdLabel').html(memberId);
        otherUserLastVideoStatus3 = 1;
    } else {
        alert("最多只能打开4路视频画面");
        return;
    }
    posx = getViewDivPosX(viewDiv);
    posy = getViewDivPosY(viewDiv);
    //posx = $('#win_x').val();
    //posy = $('#win_y').val();
    //观看自己的视频画面
    if (memberId == loginInfo.identifier) {
        memberId = '';
        qavSdk.SetVideoWinPos(memberId, posx, posy, width, height);
    } else {//看其他成员视频画面
        checkViewFlag = true;
        checkViewMemberId = memberId;
        checkViewPosX = posx;
        checkViewPosY = posy;
        checkViewWidth = width;
        checkViewHeight = height;
        //请求观看当前所有已打开视频的成员画面
        requestViewList(getCurOpenViewUserIds());
    }
}
//退出房间
function exitRoom()
{
    if (currentStatus < StatusType.enter_room) {
        alert('退出房间失败：未加入房间');
        return;
    }
    //先取消所有成员视频
    cancelAllView();
    //再退出房间
    qavSdk.ExitRoom();
}

//清空成员视频画面
function resetView() {
    var userId;
    if (!isMainUsable) {
        userId = mainUserId;
        if (userId == loginInfo.identifier) {
            userId = '';
        }
        qavSdk.SetVideoWinPos(userId, 0, 0, 0, 0);
        mainUserId = null;
        isMainUsable = true;
        mainUserLastVideoStatus = 0;
        $('#mainViewUserIdLabel').html('');
        $('#mainViewVideoStatusLabel').html('');
    }
    if (!isOther1Usable) {
        userId = otherUserId1;
        if (userId == loginInfo.identifier) {
            userId = '';
        }
        qavSdk.SetVideoWinPos(userId, 0, 0, 0, 0);
        otherUserId1 = null;
        isOther1Usable = true;
        otherUserLastVideoStatus1 = 0;
        $('#other1ViewUserIdLabel').html('');
        $('#other1ViewVideoStatusLabel').html('');
    }
    if (!isOther2Usable) {
        userId = otherUserId2;
        if (userId == loginInfo.identifier) {
            userId = '';
        }
        qavSdk.SetVideoWinPos(userId, 0, 0, 0, 0);
        otherUserId2 = null;
        isOther2Usable = true;
        otherUserLastVideoStatus2 = 0;
        $('#other2ViewUserIdLabel').html('');
        $('#other2ViewVideoStatusLabel').html('');
    }
    if (!isOther3Usable) {
        userId = otherUserId3;
        if (userId == loginInfo.identifier) {
            userId = '';
        }
        qavSdk.SetVideoWinPos(userId, 0, 0, 0, 0);
        otherUserId3 = null;
        isOther3Usable = true;
        otherUserLastVideoStatus3 = 0;
        $('#other3ViewUserIdLabel').html('');
        $('#other3ViewVideoStatusLabel').html('');
    }
    //清空成员列表
    resetRoomMemberList();
    $("#camera_list").empty();
    $("#mic_list").empty();
    $("#player_list").empty();
    setCamaraCheckedStatus(0);
    setMicCheckedStatus(0);
    var micSlider = $("#mic_volume").data("ionRangeSlider");
    micSlider.update({
        disable: false
    });
    setPlayerCheckedStatus(0);
    var playerSlider = $("#player_volume").data("ionRangeSlider");
    playerSlider.update({
        disable: false
    });
    //取消成员视频画面
    //cancelAllView();
}

//打开或关闭房间成员静音
function setMemberVolumn(userId, isMute) {
    qavSdk.MuteAudio(userId, isMute);
}
//单击打开或关闭成员声音按钮事件
function setMemberViewVolumn(bt) {
    var btId = bt.id;
    var userId;
    switch (btId) {
        case 'setMainViewVolumnBt':
            if (isMainUsable) {
                alert('未打开主用户视频画面');
                return;
            }
            userId = mainUserId;
            break;
        case 'setOtherViewVolumnBt1':
            if (isOther1Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            userId = otherUserId1;
            break;
        case 'setOtherViewVolumnBt2':
            if (isOther2Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            userId = otherUserId2;
            break;
        case 'setOtherViewVolumnBt3':
            if (isOther3Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            userId = otherUserId3;
            break;
        default:
            alert('未知按钮ID');
            return;
            break;
    }
    btId = '#' + btId;
    var isMute = $(btId).val();
    if (isMute == 1) {
        $(btId).html('打开声音');
        $(btId).val(0);
    } else {
        $(btId).html('静音');
        $(btId).val(1);
    }
    setMemberVolumn(userId, isMute);
    alert('设置静音成功');
}
//切换到主视频用户
function setOtherToMainView(bt) {
    var btId = bt.id;
    var viewDiv;
    var userId;
    var posx, posy, width, height;
    switch (btId) {
        case 'setOtherToMainViewBt1':

            if (!isMainUsable) {
                viewDiv = 'other1View';
                userId = mainUserId;
                if (userId == loginInfo.identifier) {
                    userId = '';
                }
                posx = $("#" + viewDiv).offset().left;
                posy = ($("#" + viewDiv).offset().top) + FIX_POSITION_Y;
                width = OtherView.WIDTH;
                height = OtherView.HEIGHT;
                qavSdk.SetVideoWinPos(userId, posx, posy, width, height);
            }
            if (!isOther1Usable) {
                viewDiv = 'mainView';
                userId = otherUserId1;
                if (userId == loginInfo.identifier) {
                    userId = '';
                }
                posx = getViewDivPosX(viewDiv);
                posy = getViewDivPosY(viewDiv);
                if (!validNumber($("#win_width").val())) {
                    alert('主视频用户画面宽度非法');
                    return;
                }
                if (!validNumber($("#win_height").val())) {
                    alert('主视频用户画面高度非法');
                    return;
                }
                width = parseInt($('#win_width').val());
                height = parseInt($('#win_height').val());
                qavSdk.SetVideoWinPos(userId, posx, posy, width, height);
            }
            if (!isMainUsable) {
                if (!isOther1Usable) {
                    userId = mainUserId;
                    mainUserId = otherUserId1;
                    otherUserId1 = userId;
                    $('#mainViewUserIdLabel').html(mainUserId);
                    $('#other1ViewUserIdLabel').html(otherUserId1);

                } else {
                    isMainUsable = true;
                    isOther1Usable = false;
                    otherUserId1 = mainUserId;
                    mainUserId = null;
                    $('#mainViewUserIdLabel').html('');
                    $('#mainViewVideoStatusLabel').html('');
                    $('#other1ViewUserIdLabel').html(otherUserId1);
                }
            } else {
                if (!isOther1Usable) {
                    isMainUsable = false;
                    isOther1Usable = true;
                    mainUserId = otherUserId1;
                    otherUserId1 = null;
                    $('#mainViewUserIdLabel').html(mainUserId);
                    $('#other1ViewUserIdLabel').html('');
                    $('#other1ViewVideoStatusLabel').html('');
                } else {
                    alert('没有打开任何用户视频画面，暂不能进行切换操作');
                }
            }
            break;
        case 'setOtherToMainViewBt2':
            if (!isMainUsable) {
                viewDiv = 'other2View';
                userId = mainUserId;
                if (userId == loginInfo.identifier) {
                    userId = '';
                }
                posx = getViewDivPosX(viewDiv);
                posy = getViewDivPosY(viewDiv);
                width = OtherView.WIDTH;
                height = OtherView.HEIGHT;
                qavSdk.SetVideoWinPos(userId, posx, posy, width, height);
            }
            if (!isOther2Usable) {
                viewDiv = 'mainView';
                userId = otherUserId2;
                if (userId == loginInfo.identifier) {
                    userId = '';
                }
                posx = getViewDivPosX(viewDiv);
                posy = getViewDivPosY(viewDiv);
                if (!validNumber($("#win_width").val())) {
                    alert('主视频用户画面宽度非法');
                    return;
                }
                if (!validNumber($("#win_height").val())) {
                    alert('主视频用户画面高度非法');
                    return;
                }
                width = parseInt($('#win_width').val());
                height = parseInt($('#win_height').val());
                qavSdk.SetVideoWinPos(userId, posx, posy, width, height);
            }
            if (!isMainUsable) {
                if (!isOther2Usable) {
                    userId = mainUserId;
                    mainUserId = otherUserId2;
                    otherUserId2 = userId;
                    $('#mainViewUserIdLabel').html(mainUserId);
                    $('#other2ViewUserIdLabel').html(otherUserId2);
                } else {
                    isMainUsable = true;
                    isOther2Usable = false;
                    otherUserId2 = mainUserId;
                    mainUserId = null;
                    $('#mainViewUserIdLabel').html('');
                    $('#mainViewVideoStatusLabel').html('');
                    $('#other2ViewUserIdLabel').html(otherUserId2);
                }
            } else {
                if (!isOther2Usable) {
                    isMainUsable = false;
                    isOther2Usable = true;
                    mainUserId = otherUserId2;
                    otherUserId2 = null;
                    $('#mainViewUserIdLabel').html(mainUserId);
                    $('#other2ViewUserIdLabel').html('');
                    $('#other2ViewVideoStatusLabel').html('');
                } else {
                    alert('没有打开任何用户视频画面，暂不能进行切换操作');
                }
            }
            break;
        case 'setOtherToMainViewBt3':
            if (!isMainUsable) {
                viewDiv = 'other3View';
                userId = mainUserId;
                if (userId == loginInfo.identifier) {
                    userId = '';
                }
                posx = getViewDivPosX(viewDiv);
                posy = getViewDivPosY(viewDiv);
                width = OtherView.WIDTH;
                height = OtherView.HEIGHT;
                qavSdk.SetVideoWinPos(userId, posx, posy, width, height);
            }
            if (!isOther3Usable) {
                viewDiv = 'mainView';
                userId = otherUserId3;
                if (userId == loginInfo.identifier) {
                    userId = '';
                }

                posx = getViewDivPosX(viewDiv);
                posy = getViewDivPosY(viewDiv);
                if (!validNumber($("#win_width").val())) {
                    alert('主视频用户画面宽度非法');
                    return;
                }
                if (!validNumber($("#win_height").val())) {
                    alert('主视频用户画面高度非法');
                    return;
                }
                width = parseInt($('#win_width').val());
                height = parseInt($('#win_height').val());
                qavSdk.SetVideoWinPos(userId, posx, posy, width, height);
            }
            if (!isMainUsable) {
                if (!isOther3Usable) {
                    userId = mainUserId;
                    mainUserId = otherUserId3;
                    otherUserId3 = userId;
                    $('#mainViewUserIdLabel').html(mainUserId);
                    $('#other3ViewUserIdLabel').html(otherUserId3);
                } else {
                    isMainUsable = true;
                    isOther3Usable = false;
                    otherUserId3 = mainUserId;
                    mainUserId = null;
                    $('#mainViewUserIdLabel').html('');
                    $('#mainViewVideoStatusLabel').html('');
                    $('#other3ViewUserIdLabel').html(otherUserId3);
                }
            } else {
                if (!isOther3Usable) {
                    isMainUsable = false;
                    isOther3Usable = true;
                    mainUserId = otherUserId3;
                    otherUserId3 = null;
                    $('#mainViewUserIdLabel').html(mainUserId);
                    $('#other3ViewUserIdLabel').html('');
                    $('#other3ViewVideoStatusLabel').html('');
                } else {
                    alert('没有打开任何用户视频画面，暂不能进行切换操作');
                }
            }
            break;
        default:
            alert('未知按钮ID');
            return;
            break;
    }
}
//关闭成员视频画面按钮单击事件
function cancelViewClick(bt) {
    var btId = bt.id;
    var userId;
    switch (btId) {
        case 'cancelMainViewBt':
            if (isMainUsable) {
                alert('未打开主用户视频画面');
                return;
            }
            userId = mainUserId;
            mainUserId = null;
            $('#mainViewUserIdLabel').html('');
            $('#mainViewVideoStatusLabel').html('');
            isMainUsable = true;
            break;
        case 'cancelOtherViewBt1':
            if (isOther1Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            userId = otherUserId1;
            otherUserId1 = null;
            isOther1Usable = true;
            $('#other1ViewUserIdLabel').html('');
            $('#other1ViewVideoStatusLabel').html('');
            break;
        case 'cancelOtherViewBt2':
            if (isOther2Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            userId = otherUserId2;
            otherUserId2 = null;
            isOther2Usable = true;
            $('#other2ViewUserIdLabel').html('');
            $('#other2ViewVideoStatusLabel').html('');
            break;
        case 'cancelOtherViewBt3':
            if (isOther3Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            userId = otherUserId3;
            otherUserId3 = null;
            isOther3Usable = true;
            $('#other3ViewUserIdLabel').html('');
            $('#other3ViewVideoStatusLabel').html('');
            break;
        default:
            alert('未知按钮ID');
            return;
            break;
    }
    if (userId == loginInfo.identifier) {
        userId = '';
    } else {
        //取消该成员画面
        cancelView(userId);
    }
    //关闭成员视频画面
    qavSdk.SetVideoWinPos(userId, 0, 0, 0, 0);
}
//重绘成员视频画面窗口位置
function relocationView() {
    if (!isMainUsable) {
        setVideoViewById(mainUserId, 'mainView');
    }
    if (!isOther1Usable) {
        setVideoViewById(otherUserId1, 'other1View');
    }
    if (!isOther2Usable) {
        setVideoViewById(otherUserId2, 'other2View');
    }
    if (!isOther3Usable) {
        setVideoViewById(otherUserId3, 'other3View');
    }
}
//根据成员ID和DIV重绘视频画面位置
function setVideoViewById(userId, viewDiv) {
    var width, height, posx, posy;
    posx = getViewDivPosX(viewDiv, true);
    posy = getViewDivPosY(viewDiv, true);
    if (viewDiv == 'mainView') {
        width = parseInt($('#win_width').val());
        height = parseInt($('#win_height').val());
    } else {
        width = OtherView.WIDTH;
        height = OtherView.HEIGHT;
    }

    if (posx > 0 && posy > 0) {
        log.info('[' + relocationCount + ']userId=' + userId + ',viewDiv=' + viewDiv + ",x=" + posx + ',y=' + posy + ',width=' + width + ',height=' + height);
        if (userId == loginInfo.identifier) {
            userId = '';
        }
        qavSdk.SetVideoWinPos(userId, posx, posy, width, height);
    }
}
function getDocTop() {
    return document.documentElement.scrollTop || document.body.scrollTop;
}
function getDocLeft() {
    return document.documentElement.scrollLeft || document.body.scrollLeft;
}
//根据div获取div的左上角x坐标
//isRelocation true表示是滚动浏览器窗口触发的重绘画面事件
function getViewDivPosX(viewDiv, isRelocation) {
    var posx = $("#" + viewDiv).offset().left;
    if (isRelocation) {
        posx -= getDocLeft();
    }
    if(osName=='Win10'){
        posx+=250;
    }
    return Math.round(posx);
}
//根据div获取div的左上角x坐标
function getViewDivPosY(viewDiv, isRelocation) {
    var posy = $("#" + viewDiv).offset().top + FIX_POSITION_Y;
    if (isRelocation) {
        posy -= getDocTop();
    }
    if(osName=='Win10'){
        posy+=50;
    }
    return Math.round(posy);
}
//获取当前已打开视频画面的成员ID（除了自己）
function getCurOpenViewUserIds() {
    var list = new Array;
    if (!isMainUsable && mainUserId && mainUserId != loginInfo.identifier) {
        list.push(mainUserId);
    }
    if (!isOther1Usable && otherUserId1 && otherUserId1 != loginInfo.identifier) {
        list.push(otherUserId1);
    }
    if (!isOther2Usable && otherUserId2 && otherUserId2 != loginInfo.identifier) {
        list.push(otherUserId2);
    }
    if (!isOther3Usable && otherUserId3 && otherUserId3 != loginInfo.identifier) {
        list.push(otherUserId3);
    }
    return list;
}

//单击旋转按钮事件
//rotationType: 0-不旋转， 1-90， 2-180， 3-270
function setMemberViewAngle(viewID,rotationType) {
    //var btId = bt.id;
    var userId;
    switch (viewID) {
        case 'mainView':
            if (isMainUsable) {
                alert('未打开主用户视频画面');
                return;
            }
            userId = mainUserId;
            break;
        case 'otherView1':
            if (isOther1Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            userId = otherUserId1;
            break;
        case 'otherView2':
            if (isOther2Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            userId = otherUserId2;
            break;
        case 'otherView3':
            if (isOther3Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            userId = otherUserId3;
            break;
        default:
            alert('未知按钮ID');
            return;
            break;
    }
    if (userId == loginInfo.identifier) {
        userId = '';
    }
    qavSdk.RotateView(userId, rotationType);
}

//单击截图按钮事件
function cutMemberViewPic(bt) {
    var btId = bt.id;
    var userId;
    switch (btId) {
        case 'cutMainViewPicBt':
            if (isMainUsable) {
                alert('未打开主用户视频画面');
                return;
            }
            userId = mainUserId;
            break;
        case 'cutOtherViewPicBt1':
            if (isOther1Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            userId = otherUserId1;
            break;
        case 'cutOtherViewPicBt2':
            if (isOther2Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            userId = otherUserId2;
            break;
        case 'cutOtherViewPicBt3':
            if (isOther3Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            userId = otherUserId3;
            break;
        default:
            alert('未知按钮ID');
            return;
    }
    if (userId == loginInfo.identifier) {
        userId = '';
    }
    var picType=0;//设置截图类型，由于目前只支持bmp类型，所以传任何值都保存为bmp截图
    var isRetBase64=1;//是否在回调函数中返回截图base64编码，非0表示返回，0表示不返回
    qavSdk.SnapShotAndOutput(userId, picType,snapShotFilePath,isRetBase64);
}

//单击全屏按钮事件
function fullScreenMemberView(bt) {
    var btId = bt.id;
    var userId;
    switch (btId) {
        case 'fullScreenMainViewBt':
            if (isMainUsable) {
                alert('未打开主用户视频画面');
                return;
            }
            userId = mainUserId;
            fullScreenMemberViewDiv='mainView';
            break;
        case 'fullScreenOtherViewBt1':
            if (isOther1Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            fullScreenMemberViewDiv='other1View';
            userId = otherUserId1;
            break;
        case 'fullScreenOtherViewBt2':
            if (isOther2Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            fullScreenMemberViewDiv='other2View';
            userId = otherUserId2;
            break;
        case 'fullScreenOtherViewBt3':
            if (isOther3Usable) {
                alert('未打开其他用户视频画面');
                return;
            }
            fullScreenMemberViewDiv='other3View';
            userId = otherUserId3;
            break;
        default:
            alert('未知按钮ID');
            return;
    }
    
    fullScreenMemberId=userId;
    if (userId == loginInfo.identifier) {
        userId = '';
    }
    qavSdk.SetVideoWinPos(userId, 0, 0, docWidth, docHeight);
    isFullScreen=true;
}

//全屏显示后，按ESC键，触发重置视频画面位置和大小操作
function resetFullScreenMemberView() {
    if(isFullScreen && fullScreenMemberId && fullScreenMemberViewDiv){
        setVideoViewById(fullScreenMemberId,fullScreenMemberViewDiv);
        isFullScreen=false;
        fullScreenMemberId=null;
        fullScreenMemberViewDiv=null;
    }else{
        log.info('isFullScreen=' + isFullScreen + ',fullScreenMemberId=' + fullScreenMemberId + ',fullScreenMemberViewDiv=' + fullScreenMemberViewDiv);
    }
}
