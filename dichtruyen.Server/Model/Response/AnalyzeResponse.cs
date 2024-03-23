namespace dichtruyen.Server.Model.Request
{
    public class AnalyzeResponse
    {
        public List<TranslateResult> name { get; set; }
    }

    public class TranslateResult
    {
        public string Origin { get; set; }
        public string Translated { get; set; }
    }
}
