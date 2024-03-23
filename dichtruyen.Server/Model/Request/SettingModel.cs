namespace dichtruyen.Server.Model.Request
{
    public class SettingModel
    {
        public List<TranslateResult> Name { get; set; }
        public string Role { get; set; }
        public string Type { get; set; }
        public string Voice { get; set; }
        public string Time { get; set; }
        public string Promt { get; set; }
        public string[] AdditionalRequirements { get; set; }
    }
}