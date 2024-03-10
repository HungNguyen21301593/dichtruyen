using AngleSharp;
using AngleSharp.Dom;
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
            if (!request.Url.Contains("metruyencv"))
            {
                return BadRequest("Chỉ hỗ trợ nguồn truyện metruyencv");
            }

            if (!request.Url.Contains("chuong"))
            {
                return BadRequest("Vui lòng nhập link chương truyện");
            }


            try
            {
                var config = Configuration.Default.WithDefaultLoader();
                var document = await BrowsingContext.New(config).OpenAsync(request.Url);

                if (document == null)
                {
                    return NotFound("Failed to load the website");
                }


                // Extract text from the website
                var title = document.QuerySelector(".nh-read__title")?.TextContent;
                var articleNodes = document.QuerySelector("#article")?.ChildNodes;
                if (articleNodes == null)
                {
                    return NotFound("Failed to load the website");
                }
                var lines = new List<string>();
                foreach (var node in articleNodes.ToList())
                {

                    lines.Add(node.TextContent);
                }

                return Ok(new ScanReqsponse
                { 
                    Url = request.Url,
                    Title = title??"",
                    lines = lines
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error scanning website: {request.Url}");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
