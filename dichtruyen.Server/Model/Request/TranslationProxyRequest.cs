namespace dichtruyen.Server.Model.Request
{
    public class TranslationProxyRequest : SettingModel
    {
        public string ExampleInput { get; set; }
        public string ExampleOutput { get; set; }
        public string TextToTranslate { get; set; }
    }

}
