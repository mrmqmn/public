<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Insert title here</title>
<script src="http://qzonestyle.gtimg.cn/open/qcloud/video/live/h5/live_connect.js"
charset="utf-8" ></script>

</head>
<body>
<div id="element_id" style="width:800px;height:600px;"></div>

<script type="text/javascript">
	var player = new qcVideo.Player(
		//页面放置播放位置的元素 ID
		"element_id" ,
		{
			//播放器宽度，单位像素(必选参数)
			"width" : 640,
			//播放器高度，单位像素(必选参数)
			"height" : 480,
			//直播地址，支持 hls/rtmp/flv 三种格式(必选参数)
			//"live_url": "rtmp://http://xxx.liveplay.qcloud.com/live/xxx",
			//直播地址，同上，（可选参数）
			"live_url": "http://2107.liveplay.myqcloud.com/2107_e3f406e707a311e6b91fa4dcbef5e35a.m3u8",
			//直播画面开始播放前，最大缓存时间 ; 这个属性可有效下行带宽不足导致避免 rtmp 直播 卡顿的情况 (可选参数)
			"cache_time": 0.3,
			//h5播放，开始播放前贴片(可选参数)
			//"h5_start_patch":"tets",
			//直播提示语自定义（目前仅支持 h5播放，后面将会支持 flash 播放提示配置）(可选参数)
			//"wording": 0.3
		}
	);
</script>
</body>
</html>