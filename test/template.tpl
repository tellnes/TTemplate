<h1>Template test</h1>
<pre>
{template name="vt1"}
A
{display name="vt2"}
C
{/template}

{template name="vt2"}
B
{/template}



{display name="vt1"}

{$hello} World
{$hello} World

</pre>