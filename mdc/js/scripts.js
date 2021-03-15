$(".add, .edit").click(function(){
	$("section.add-card").addClass('up');
	$("section#items").hide();
});
$("#submit").click(function(){
	$("section.add-card").removeClass('up');
	$("section#items").show();
});