namespace dichtruyen.Server.Model.Request
{
    public class TranslationRequest
    {
        public List<Content> Contents { get; set; }
        public List<SafetySetting> SafetySettings { get; set; }
        public GenerationConfig GenerationConfig { get; set; }
    }

    public class Content
    {
        public List<Part> Partseee { get; set; }
    }

    public class Part
    {
        public string Text { get; set; }
    }

    public class SafetySetting
    {
        public string Category { get; set; }
        public string Threshold { get; set; }
    }

    public class GenerationConfig
    {
        public List<string> StopSequences { get; set; }
        public double Temperature { get; set; }
        public int MaxOutputTokens { get; set; }
        public double TopP { get; set; }
        public int TopK { get; set; }
    }


}
