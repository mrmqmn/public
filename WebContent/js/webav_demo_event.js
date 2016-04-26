//回调函数
/*
 * evt 事件类型，参考后面的事件类型定义
 * result 结果，0：成功，非0表示失败
 * oper 操作类型，evt=3155、3156、3158时有效
 * vcnt 房间成员个数，evt=3150时有效
 * vusers，房间成员列表，evt=3150时有效
 * info 附加信息
 */
function qavsdk_eventcallback(evt, result, oper, vcnt, vusers, info, picBase64Str)
{
    log.info("evt = " + evt + " result = " + result + " oper = " + oper + " vcnt = " + vcnt);
    var msg, memberList = '';
    if (result == 0) {
        if (vcnt > 0)
        {
            //房间成员列表
            memberList = vusers.toArray();
        }
        switch (evt) {
            case EventType.LOGIN://登录成功
                //设置当前状态处于登录成功态
                currentStatus = StatusType.login;
                //清空事件通知下拉列表
                $("#notice_list").empty();
                addNotice('[登录][成功]用户ID:' + loginInfo.identifier);
                log.info('[登录][成功]用户ID:' + loginInfo.identifier);
                //只有SDK登录成功，才可以启动SDK
                startContext();
                break;
            case EventType.START_CONTEXT://启动SDK成功
                //设置当前状态处于启动SDK成功态
                currentStatus = StatusType.context;
                log.info('[启动SDK][成功]');
                addNotice('[启动SDK][成功]');
                //初始化demo
                initDemoApp();
                break;
            case EventType.STOP_CONTEXT://停止SDK成功
                log.info('[停止SDK][成功]');
                //设置当前状态处于登录成功态
                currentStatus = StatusType.login;
                addNotice('[停止SDK][成功]');
                //清空成员视频画面
                resetView();
                curentRoomId = null;
                inputRoomId = null;
                loginInfo.identifier = null;
                loginInfo.userSig = null;
                $('#myself_type_desc').hide();
                $('#demo_type_desc').show();
                $('#sdkAppIdDiv').hide();
                $('#accountTypeDiv').hide();
                isQuitFlag = false;
                //跳转到首页
                window.location.href = callBackUrl;
                break;
            case EventType.ENTER_ROOM://进入房间成功
                log.info('[加入房间][成功]:' + "操作者:" + oper + ",当前成员数:" + vcnt);
                addNotice('[加入房间][成功]:' + "操作者:" + oper + ",当前成员数:" + vcnt);
                //设置当前状态处于加入房间成功态
                currentStatus = StatusType.enter_room;
                curentRoomId = inputRoomId;
                //默认选中第一个摄像头
                setSelectedCameraIndex(0);
                //打开摄像头
                openCamera();
                //默认选中第一个麦克风
                setSelectedMicIndex(0);
                //打开麦克风
                openMic();
                //默认选中第一个扬声器
                setSelectedPlayerIndex(0);
                //打开扬声器
                openPlayer();
                break;
            case EventType.EXIT_ROOM://退出房间成功
                log.info('[退出房间][成功]:' + "操作者:" + oper + ",当前成员数:" + vcnt);
                addNotice('[退出房间][成功]:' + "操作者:" + oper + ",当前成员数:" + vcnt);
                //设置当前状态处于启动SDK成功态
                currentStatus = StatusType.context;
                curentRoomId = null;
                inputRoomId = null;

                //清空成员视频画面
                resetView();
                alert('退出房间成功');
                //如果单击了返回登录按钮
                if (isQuitFlag) {
                    isQuitFlag = false;
                    stopContext();
                }
                break;
            case EventType.ROOM_MEMBERS_CHANGE://房间成员变化通知
                log.info('[房间成员变化]:' + "操作者:" + oper + ",当前成员数:" + vcnt);
                addNotice('[房间成员变化]:' + "操作者:" + oper + ",当前成员数:" + vcnt);
                //重置房间成员下拉列表
                setRoomMemberList(memberList);
                break;
            case EventType.REQUEST_VIEW_LIST://查看其他成员列表画面成功
                if (checkViewFlag) {
                    checkViewFlag = false;
                    log.info('[打开成员画面窗口][成功]:' + "userId:" + checkViewMemberId + ',x=' + checkViewPosX + ',y=' + checkViewPosY + ',w=' + checkViewWidth + ',h=' + checkViewHeight);
                    qavSdk.SetVideoWinPos(checkViewMemberId, checkViewPosX, checkViewPosY, checkViewWidth, checkViewHeight);
                }
                log.info('[查看其他成员列表画面][成功]:' + "操作者:" + oper);
                addNotice('[查看其他成员列表画面][成功]:' + "操作者:" + oper);
                break;
            case EventType.CANCEL_ALL_VIEW://取消所有成员画面成功
                log.info('[取消所有成员画面][成功]:' + "操作者:" + oper);
                addNotice('[取消所有成员画面][成功]:' + "操作者:" + oper);
                break;
            case EventType.MIC_STATUS_CHANGE://打开/关闭麦克风结果通知 oper 1-打开，2-关闭
                if (oper == 1) {
                    msg = '[打开麦克风]';
                } else if (oper == 2) {
                    msg = '[关闭麦克风]';
                    if (changeMicFlag) {
                        changeMicFlag = false;
                        setSelectedMicIndex(curMicIndex);
                        openMic();
                    }
                }
                log.info(msg + '[成功]');
                addNotice(msg + '[成功]');
                //重置麦克风下拉列表
                resetMicList();
                break;
            case EventType.PLAYER_STATUS_CHANGE://打开/关闭扬声器结果通知 oper 1-打开，2-关闭
                if (oper == 1) {
                    msg = '[打开扬声器]';
                } else if (oper == 2) {
                    msg = '[关闭扬声器]';
                    if (changePlayerFlag) {
                        changePlayerFlag = false;
                        setSelectedPlayerIndex(curPlayerIndex);
                        openPlayer();
                    }
                }
                log.info(msg + '[成功]');
                addNotice(msg + '[成功]');
                //重置扬声器下拉列表
                resetPlayerList();
                break;
            case EventType.CAMERA_STATUS_CHANGE://打开/关闭摄像头通知 oper 1-打开，2-关闭
                if (oper == 1) {
                    msg = '[打开摄像头]';
                    //$("input[name='camera_status_radio']").eq(0).attr("checked", "checked");
                    //$("input[name='camera_status_radio']").eq(1).removeAttr("checked");
                    //$("input[name='camera_status_radio']").eq(0).click();
                } else if (oper == 2) {
                    msg = '[关闭摄像头]';

                    if (changeCameraFlag) {
                        changeCameraFlag = false;
                        setSelectedCameraIndex(curCameraIndex);
                        openCamera();
                    }

                }
                log.info(msg + '[成功]');
                addNotice(msg + '[成功]');
                //重置摄像头下拉列表
                resetCameraList();
                break;
            case EventType.SCREEN_SHOT://截图成功通知
                log.info('[截图][成功]:' + '图片存放路径: ' + info);
                addNotice('[截图][成功]:' + '图片存放路径: ' + info);
                if (picBase64Str) {
                    log.info('[截图][成功]:' + '图片base64编码: ' + picBase64Str);
                    addNotice('[截图][成功]:' + '图片base64编码大小: ' + picBase64Str.length);
                }
                alert('截图成功,图片存放路径: ' + info);
                break;
            case EventType.START_RECORD_VIDEO://开始录制视频成功通知
                log.info('[开始录制视频][成功]:' + '录制视频类型: curRecordVideoType=' + curRecordVideoType);
                addNotice('[开始录制视频][成功]:' + '录制视频类型: curRecordVideoType=' + curRecordVideoType);
                alert('开始录制视频成功');
                break;
            case EventType.STOP_RECORD_VIDEO://停止录制视频成功通知
                curRecordVideoType = null;
                log.info('[停止录制视频][成功]');
                addNotice('[停止录制视频][成功]');
                alert('停止录制视频成功');
                break;
            default :
                log.info("[未知通知类型]evt=" + evt);
                alert("[未知通知类型]evt=" + evt);
                addNotice("[未知通知类型]evt=" + evt);
                break;
        }
    } else {
        var errInfo=getEventErrorInfo(evt,oper,info);
        alert(errInfo);
        addNotice(errInfo);
        log.error(errInfo);
    }
}
function addNotice(msg) {
    $("#notice_list")[0].options.add(new Option(msg, noticeCount++));
}
//获取操作错误信息
function getEventErrorInfo(evtType, oper, info) {
    
    var eventName=EventName[evtType];
    if(!eventName){
        eventName='未知事件';
    }
    var errInfo="["+eventName+"][回调发生错误], 事件类型evt="+evtType+", 错误码oper="+oper+", 错误信息info="+info;
    return errInfo;
}
