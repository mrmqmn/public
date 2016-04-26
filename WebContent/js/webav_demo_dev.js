//获取选中摄像头ID
function GetSelectedCameraId()
{
    log.info('start GetSelectedCameraId');
    var devName = qavSdk.GetSelectedCameraId();
    log.info('after GetSelectedCameraId=' + devName);
}
//设置选中摄像头索引
function setSelectedCameraIndex(index)
{
    if (index == null || index == "undefined") {
        index = 0;
    }
    log.info('start SetSelectedCameraIndex,index=' + index);
    qavSdk.SetSelectedCameraIndex(index);
    log.info('after SetSelectedCameraIndex');
}
//打开摄像头
function openCamera()
{
    log.info('start OpenCamera,cameraIndex=' + curCameraIndex);
    qavSdk.OpenCamera();
    log.info('after OpenCamera');
}
//关闭摄像头
function closeCamera()
{
    log.info('start closeCamera,cameraIndex=' + curCameraIndex);
    qavSdk.CloseCamera();
    log.info('after CloseCamera');
}
//打开或关闭摄像头单选按钮单击事件
function changeCameraStatus(item) {
    //GetSelectedCameraId();
    var status = item.value;
    if (status == 1) {//开
        openCamera();
    } else if (status == 0) {//关
        closeCamera();
    }
}
//重置摄像头列表
function resetCameraList()
{
    $("#camera_list").empty();
    var list = new Array;
    log.info('start GetCameraList');
    //获取摄像头列表
    qavSdk.GetCameraList(list);
    log.info('after GetCameraList,list=' + list);
    if (list && list.length > 0) {
        for (var i = 0; i < list.length; i++)
        {
            $("#camera_list")[0].options.add(new Option(list[i], i));
        }
        //在下拉列表中选中当前摄像头
        $("#camera_list").val(curCameraIndex);
    }
}

//切换摄像头
function cameraListOnChange(index) {
    var avStatus = qavSdk.GetEndpointAVMode(loginInfo.identifier);
    //保存新摄像头索引
    curCameraIndex = index;
    if (avStatus == AVStatus.ONLY_VIDEO || avStatus == AVStatus.BOTH_AUDIO_AND_VIDEO) {
        //设置切换摄像头标记
        changeCameraFlag = true;
        //先关闭之前选中的摄像头
        //当老摄像头是开启的状态，需要先将其关闭，在关闭摄像头成功的回调事件中打开新的摄像头
        closeCamera();

    } else {//当老摄像头是关闭的状态，则直接打开新摄像头
        //设置新摄像头索引
        setSelectedCameraIndex(index);
    }
}
//设置摄像头单选按钮状态
function setCamaraCheckedStatus(checkedIndex) {
    var otherIndex;
    if(checkedIndex==0){
        otherIndex=1;
    }else if(checkedIndex==1){
        otherIndex=0;
    }else{
        return;
    }
    $("input[name='camera_status_radio']").eq(checkedIndex).attr("checked", "checked");
    $("input[name='camera_status_radio']").eq(otherIndex).removeAttr("checked");
    $("input[name='camera_status_radio']").eq(checkedIndex).click();
}
//////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////
//获取选中麦克风ID
function getSelectedMicId()
{
    log.info('start GetSelectedMicId');
    var devName = qavSdk.GetSelectedMicId();
    log.info('after GetSelectedMicId=' + devName);
}
//设置选中麦克风索引
function setSelectedMicIndex(index)
{
    if (index == null || index == "undefined") {
        index = 0;
    }
    log.info('start SetSelectedMicIndex,index=' + index);
    qavSdk.SetSelectedMicIndex(index);
    log.info('after SetSelectedMicIndex');
}
//打开麦克风
function openMic()
{
    log.info('start OpenMic');
    qavSdk.OpenMic();
    log.info('after OpenMic');
}
//关闭麦克风
function closeMic()
{
    log.info('start CloseMic');
    qavSdk.CloseMic();
    log.info('after CloseMic');
}
//开，关麦克风单选按钮单击事件
function changeMicStatus(item) {
    //GetSelectedMicId();
    var status = item.value;
    var slider = $("#mic_volume").data("ionRangeSlider");
    if (status == 1) {//开
        openMic();
        slider.update({
            disable: false
        });
    } else if (status == 0) {//关
        closeMic();
        slider.update({
            disable: true
        });
    }
}
//重置麦克风下拉列表
function resetMicList()
{
    $("#mic_list").empty();
    var list = new Array;
    log.info('start GetMicList');
    //获取麦克风列表
    qavSdk.GetMicList(list);
    log.info('after GetMicList,list=' + list);
    if (list && list.length > 0) {
        for (var i = 0; i < list.length; i++)
        {
            $("#mic_list")[0].options.add(new Option(list[i], i));
        }
        //在下拉列表中选中当前使用的麦克风
        $("#mic_list").val(curMicIndex);
    }
}
//获取麦克风音量
function getMicVolumn() {
    log.info('start GetMicVolumn');
    var volumn = qavSdk.GetMicVolumn();
    log.info('after GetMicVolumn=' + volumn);
    return volumn;
}
//设置麦克风音量
function setMicVolumn(volume) {
    log.info('start SetMicVolumn,volume=' + volume);
    qavSdk.SetMicVolumn(volume);
    log.info('after SetMicVolumn');
}
//切换麦克风
function micListOnChange(index) {
    var avStatus = qavSdk.GetEndpointAVMode(loginInfo.identifier);
    //保存新麦克风索引
    curMicIndex = index;
    if (avStatus == AVStatus.ONLY_AUDIO || avStatus == AVStatus.BOTH_AUDIO_AND_VIDEO) {
        //设置切换麦克风标记
        changeMicFlag = true;
        //先关闭之前选中的麦克风
        //说明：当老麦克风是开启的状态，需要先将其关闭，在关闭麦克风成功的回调事件中打开新的麦克风
        closeMic();

    } else {//当老麦克风是关闭的状态
        //设置新麦克风索引
        setSelectedMicIndex(index);
    }
}
//设置摄像头单选按钮状态
function setMicCheckedStatus(checkedIndex) {
    var otherIndex;
    if(checkedIndex==0){
        otherIndex=1;
    }else if(checkedIndex==1){
        otherIndex=0;
    }else{
        return;
    }
    $("input[name='mic_status_radio']").eq(checkedIndex).attr("checked", "checked");
    $("input[name='mic_status_radio']").eq(otherIndex).removeAttr("checked");
    $("input[name='mic_status_radio']").eq(checkedIndex).click();
}
//////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////
//获取选中扬声器ID
function getSelectedPlayerId()
{
    log.info('start GetSelectedPlayerId');
    var devName = qavSdk.GetSelectedPlayerId();
    log.info('after GetSelectedPlayerId=' + devName);
}
//设置选中扬声器索引
function setSelectedPlayerIndex(index)
{
    if (index == null || index == "undefined") {
        index = 0;
    }
    log.info('start SetSelectedPlayerIndex,index=' + index);
    qavSdk.SetSelectedPlayerIndex(index);
    log.info('after SetSelectedPlayerIndex');
}
//打开扬声器
function openPlayer()
{
    log.info('start OpenPlayer');
    qavSdk.OpenPlayer();
    log.info('after OpenPlayer');
}
//关闭扬声器
function closePlayer()
{
    log.info('start ClosePlayer');
    qavSdk.ClosePlayer();
    log.info('after ClosePlayer');
}

//开，关扬声器单选按钮单击事件
function changePlayerStatus(item) {
    //GetSelectedPlayerId();
    var status = item.value;
    var slider = $("#player_volume").data("ionRangeSlider");
    if (status == 1) {//开
        openPlayer();
        slider.update({
            disable: false
        });
    } else if (status == 0) {//关
        closePlayer();
        slider.update({
            disable: true
        });
    }
}

//重置扬声器下拉列表
function resetPlayerList()
{
    //清空扬声器下拉列表
    $("#player_list").empty();
    var list = new Array;
    log.info('start GetPlayerList');
    //获取扬声器列表
    qavSdk.GetPlayerList(list);
    log.info('after GetPlayerList,list=' + list);
    if (list && list.length > 0) {
        for (var i = 0; i < list.length; i++)
        {
            $("#player_list")[0].options.add(new Option(list[i], i));
        }
        //在下拉列表选中当前使用的扬声器
        $("#player_list").val(curPlayerIndex);
    }
}
//获取扬声器音量
function getPlayerVolumn() {
    log.info('start GetPlayerVolumn');
    var volumn = qavSdk.GetPlayerVolumn();
    log.info('after GetPlayerVolumn=' + volumn);
    return volumn;
}
//设置扬声器音量
function setPlayerVolumn(volume) {
    log.info('start SetPlayerVolumn,volume=' + volume);
    qavSdk.SetPlayerVolumn(volume);
    log.info('after SetPlayerVolumn');
}
//切换扬声器
function playerListOnChange(index) {
    //设置切换扬声器标记
    changePlayerFlag = true;
    //保存新扬声器索引
    curPlayerIndex = index;
    //先关闭之前选中的扬声器
    //说明：当老扬声器是开启的状态，需要先将其关闭，并保存新扬声器索引，最后在关闭扬声器成功的回调事件中打开新的扬声器
    //当老扬声器是关闭的状态，则直接打开扬声器
    closePlayer();
    //设置新扬声器索引
    setSelectedPlayerIndex(index);
    //打开新扬声器
    openPlayer();
}
//设置扬声器单选按钮状态
function setPlayerCheckedStatus(checkedIndex) {
    var otherIndex;
    if(checkedIndex==0){
        otherIndex=1;
    }else if(checkedIndex==1){
        otherIndex=0;
    }else{
        return;
    }
    $("input[name='player_status_radio']").eq(checkedIndex).attr("checked", "checked");
    $("input[name='player_status_radio']").eq(otherIndex).removeAttr("checked");
    $("input[name='player_status_radio']").eq(checkedIndex).click();
}
//开始录制视频
function startRecordVideo(type){
    if (currentStatus < StatusType.enter_room) {
        alert('开始录制视频失败：未进入房间');
        return;
    }
    if(curRecordVideoType!=null){
        alert('正在录制视频，不能重复录制');
        return;
    }
    //type=0,表示把摄像头当作视频源，type=1，表示辅流，即把PC显示器上的图像作为视频源(web暂不支持辅流的录制)
    curRecordVideoType=type;
    var fileName;//保存的视频文件名称，不需要后缀名
    var curTimestamp=new Date().getTime();
    if(type==0){
        fileName='web_video_camera_'+curTimestamp;
    }else{
        fileName='web_video_desktop_'+curTimestamp;
    }
    var classId=Math.ceil(Math.random()*1000000);//业务自己定义的id,整型
    var isTransCode=0;//是否转码，暂时没有作用
    var isSnapShot=0;//是否截图，暂时没有作用
    var isWaterMark=0;//是否打水印，暂时没有作用
    log.info('start StartRecordVideo,curRecordVideoType='+curRecordVideoType+',filename='+fileName+',classId='+classId);
    qavSdk.StartRecordVideo(type,fileName,classId,isTransCode,isSnapShot,isWaterMark);
    log.info('after StartRecordVideo');
}

//停止录制视频
function stopRecordVideo(){
    if (currentStatus < StatusType.enter_room) {
        alert('停止录制视频失败：未进入房间');
        return;
    }
    if (curRecordVideoType==null) {
        alert('请先开始录制视频');
        return;
    }
    log.info('before StopRecordVideo,curRecordVideoType='+curRecordVideoType);
    qavSdk.StopRecordVideo(curRecordVideoType);
    log.info('after StopRecordVideo');
}


