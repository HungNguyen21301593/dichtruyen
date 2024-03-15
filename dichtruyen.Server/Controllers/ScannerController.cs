using AngleSharp;
using AngleSharp.Dom;
using AngleSharp.Io;
using dichtruyen.Server.Model.Request;
using dichtruyen.Server.Model.Response;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using Treblle.Net.Core;

namespace dichtruyen.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScannerController : ControllerBase
    {
        private readonly ILogger<ScannerController> _logger;

        public ScannerController(ILogger<ScannerController> logger)
        {
            _logger = logger;
        }

        [HttpPost(Name = "Execute")]
        [Treblle]
        public async Task<IActionResult> Execute([FromBody] ScanRequest request)
        {
            if (string.IsNullOrEmpty(request.Url))
            {
                return BadRequest("Url is required");
            }
            if (!request.Url.Contains("metruyencv") && !request.Url.Contains("69shu"))
            {
                return BadRequest("Chỉ hỗ trợ nguồn truyện metruyencv, 69shu");
            }


            try
            {

                return new OkObjectResult(await Scan(request.Url));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error scanning website: {request.Url}");
                return StatusCode(500, "Internal server error");
            }
        }

        private async Task<ScanReqsponse> Scan(string url)
        {
            if (string.IsNullOrEmpty(url))
            {
                throw new ArgumentException(url, nameof(url));
            }
            var config = Configuration.Default.WithDefaultLoader();

            if (url.Contains("metruyencv"))
            {
                var document = await BrowsingContext.New(config).OpenAsync(url);

                if (document == null)
                {
                    throw new Exception("Failed to load the website");
                }


                // Extract text from the website
                var title = document.QuerySelector(".nh-read__title")?.TextContent;
                var articleNodes = document.QuerySelector("#article")?.ChildNodes;
                if (articleNodes == null)
                {
                    throw new Exception("Failed to load the website");
                }
                var lines = new List<string>();
                foreach (var node in articleNodes.ToList())
                {

                    lines.Add(node.TextContent);
                }

                return new ScanReqsponse
                {
                    Url = url,
                    Title = title ?? "",
                    lines = lines
                };
            }

            if (url.Contains("69shu"))
            {
                var document = await BrowsingContext.New(config).OpenAsync(url);

                if (document == null)
                {
                    throw new Exception("Failed to load the website");
                }


                // Extract text from the website
                var title = document.QuerySelector("h1.hide720").TextContent;
                var articleNodes = document.QuerySelector(".txtnav").ChildNodes;
                if (articleNodes == null)
                {
                    throw new Exception("Failed to load the website");
                }
                var lines = new List<string>();
                foreach (var node in articleNodes.ToList())
                {

                    lines.Add(node.TextContent);
                }

                return new ScanReqsponse
                {
                    Url = url,
                    Title = title ?? "",
                    lines = lines
                };
            }
            throw new NotImplementedException("Failed to load the website");

        }
    }
}
