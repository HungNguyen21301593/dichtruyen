using dichtruyen.Server.Model;
using dichtruyen.Server.Model.Request;
using dichtruyen.Server.Model.Response;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.NetworkInformation;
using System.Text;
using Treblle.Net.Core;

namespace dichtruyen.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TranslateController : ControllerBase
    {
        private string API_KEY = "AIzaSyAMtguMAeVIAq4byeeQIC6UO_DwKv1v8Wk";
        private readonly ILogger<TranslateController> _logger;

        public TranslateController(ILogger<TranslateController> logger)
        {
            _logger = logger;
        }


        [HttpPost]
        [Treblle]
        public async Task<IActionResult> Translate([FromBody] TranslationProxyRequest request)
        {
            try
            {
                _logger.LogInformation($"Received {DateTime.Now} {JsonConvert.SerializeObject(request)}");
                //hãy sửa lại đoạn truyện sau cho đúng ngữ pháp tiếng việt và trả về kết quả đã chỉnh sửa
                var stringbuilder = new StringBuilder();
                stringbuilder.AppendLine($"Hãy {request.Promt} ");
                stringbuilder.AppendLine("Với các dữ liệu sau, ");
                stringbuilder.AppendLine($" ưu tiên các tên riêng: {request.Name},");
                stringbuilder.AppendLine($" thể loại {request.Type},");
                stringbuilder.AppendLine($" giọng văn: {request.Voice},");
                stringbuilder.AppendLine($" bối cảnh: {request.Time},");
                stringbuilder.AppendLine($" xưng hô {request.Role},");
                if (request.AdditionalRequirements.Any())
                {
                    stringbuilder.AppendLine($" một số yêu cầu khác: {string.Join(",", request.AdditionalRequirements)} ");
                }                
                stringbuilder.AppendLine($" ví dụ, input: {request.ExampleInput}, ");
                stringbuilder.AppendLine($" output: {request.ExampleOutput}");
                stringbuilder.AppendLine($" sau đây là đoạn truyện:");
                stringbuilder.AppendLine(request.TextToTranslate);
                var promt = stringbuilder.ToString();
                var translatedText = await CallGenerateContentApi(promt, API_KEY) ?? "";
                var tranlatedLines = translatedText.Split('\n');
                _logger.LogInformation($"Success");
                return new OkObjectResult(new TranslationProxyResponse { TranslatedLines = [.. tranlatedLines] }); // Pass the result back to the view
            }
            catch (Exception e)
            {
                _logger.LogError($"Failed: {e.Message}");
                return new OkObjectResult(new TranslationProxyResponse { TranslatedLines = [] });
            }
        }

        public static async Task<string> CallGenerateContentApi(string prompt, string apiKey)
        {
            try
            {
                // Build the URL with API key
                string url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={apiKey}";

                // Create a JSON object for the request body
                var requestData = new
                {
                    contents = new[]
                    {
                        new { parts = new[] { new { text = prompt } } }
                    },
                    safetySettings = new[]
                    {
                new { category = "HARM_CATEGORY_DANGEROUS_CONTENT", threshold = "BLOCK_NONE" },
                new { category = "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold = "BLOCK_NONE" },
                new { category = "HARM_CATEGORY_HATE_SPEECH", threshold = "BLOCK_NONE" },
                new { category = "HARM_CATEGORY_HARASSMENT", threshold = "BLOCK_NONE" }
                },
                    generationConfig = new
                    {
                        stopSequences = new[] { "Title" },
                        temperature = 1.0,
                        maxOutputTokens = 30000,
                        topP = 0.8,
                        topK = 10
                    }
                };

                // Serialize the request object to JSON string
                string jsonContent = JsonConvert.SerializeObject(requestData);

                // Create an HttpClient instance
                using var httpClient = new HttpClient();

                // Send the POST request asynchronously
                using var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync(url, content);

                // Check for successful response
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"API call failed with status code: {response.StatusCode}");
                }
                // Parse JSON response
                var responseJson = await response.Content.ReadAsStringAsync();

                var responseObject = JsonConvert.DeserializeObject<TranslationResponse>(responseJson)
                    ?? throw new Exception($"API call failed with status code: {response.StatusCode}, response: {responseJson}");
                // Extract the translated text
                string translatedText = responseObject.Candidates.First().Content.Parts.First().Text;

                // Return the translated text
                return translatedText;
            }
            catch (Exception ex)
            {
                // Handle exceptions
                Console.WriteLine($"Error calling API: {ex.Message}");
                // Implement retry logic or handle the error appropriately
                throw new Exception($"API call failed: {ex.Message}");
            }
        }
    }
}

