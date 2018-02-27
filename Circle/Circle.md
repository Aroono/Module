## Canvas环形
（适用于IE6等不支持Canvas、SVG功能得浏览器）

###使用方法：
``` bash
<div class="chart1">
    <div class="percentage" data-percent="99" m-Circle="c1"><span>92</span>%</div>                   
</div>

<script type="text/javascript">
      fw.Circle.Init({
			domStr: "c1",
			size: 100,
			lineWidth: 6,
			lineCap: 'butt',
			animate: false
		});
</script> 
```