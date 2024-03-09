namespace dichtruyen.Server.Model.Request
{
    public class TranslationProxyRequest
    {
        public string Name { get; set; }
        public string Role { get; set; }
        public string Type { get; set; }
        public string Voice { get; set; }
        public string Time { get; set; }
        public string Promt { get; set; }
        public string ExampleInput { get; set; }
        public string ExampleOutput { get; set; }
        public string TextToTranslate { get; set; }
    }

}
