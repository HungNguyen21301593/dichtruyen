namespace dichtruyen.Server.Model.Request
{
    public class AnalyzeProxyRequest
    {
        public string Text { get; set; }
        public AnalyzeResponse PreviousResult { get; set; }
    }
}
