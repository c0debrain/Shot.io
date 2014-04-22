<script id="template-modals-thumbnails-edit-selection" type="text/template">
	<div class="modal">
		<div class="modal-background"></div>

		<div class="modal-wrap">
			<div class="row">
				<div class="large-12 columns">
					<div class="modal-content">
						<form method="post">
							<fieldset>
								<legend>Title</legend>

								<div class="row">
									<div class="large-12 columns">
										<input type="text" name="title" placeholder="No change" value="{{{title}}}">
									</div>
								</div>
							</fieldset>

							<fieldset>
								<legend>Location</legend>

								<div class="row">
									<div class="large-12 columns">
										<input type="text" name="location" placeholder="No change" value="{{{location}}}">
									</div>
								</div>
							</fieldset>

							<fieldset>
								<legend>Description</legend>

								<div class="row">
									<div class="large-12 columns">
										<textarea name="description" placeholder="No change" rows="5">{{{description}}}</textarea>
									</div>
								</div>
							</fieldset>

							<fieldset>
								<legend>Thumbnail</legend>

								<div class="row">
									<div class="large-6 columns">
										<label><input type="radio" name="thumb-crop" value="smart"> Smart</label>
									</div>
									<div class="large-6 columns">
										<label><input type="radio" name="thumb-crop" value="centered"> Centred</label>
									</div>
									<div class="large-6 columns">
										<label><input type="radio" name="thumb-crop" value="topLeft"> Top/Left</label>
									</div>
									<div class="large-6 columns">
										<label><input type="radio" name="thumb-crop" value="bottomRight"> Bottom/Right</label>
									</div>
								</div>
							</fieldset>

							<fieldset>
								<div class="row">
									<div class="large-8 small-6 columns">
										<button type="submit" class="delete expand"><i class="fa fa-save"></i> Save</button>
									</div>

									<div class="large-4 small-6 columns">
										<button type="button" class="cancel secondary expand"><i class="fa fa-times"></i> Cancel</button>
									</div>
								</div>
							</fieldset>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</script>
