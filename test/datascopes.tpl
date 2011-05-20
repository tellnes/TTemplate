<h1>DataScope test</h1>

{template name="t"}{$a}{/template}

<pre>
	{assign var="a" value="A"}
	{$a}
	{display name="t"}
	
	{assign var="a" value="B"}
	{$a}
	{display name="t"}
	
</pre>