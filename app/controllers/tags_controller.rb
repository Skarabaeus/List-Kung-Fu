class TagsController < ApplicationController

	before_filter :authenticate_user!

  respond_to :json

  def index
    @tags = current_user.tags.order( "name asc" )
    respond_with( DefaultDto.new( :template => 'tags-tag',
      :data => @tags ) )
  end

  def show
    @tag = current_user.tags.where( "id = ?", params[:id] ).first
    respond_with( DefaultDto.new( :template => '', :data => @tag ) )
  end

  def new
    @tag = Tag.new
    @tag.user = current_user
    respond_with( DefaultDto.new( :template => 'tags-form', :data => @tag ) )
  end

  def edit
    @tag = current_user.tags.where( "id = ?", params[:id] ).first
    respond_to do |format|
      format.js { render :json => DefaultDto.new( :template => 'tags-form', :data => @tag ) }
    end
  end

  def create
    @tag = Tag.new(params[:tag])
    @tag.user = current_user

    if @tag.save
      flash[:notice] = 'Tag has been created.'
    end

    respond_to do |format|
      format.js { render :json => DefaultDto.new( :template => 'tags-tag',
        :data => @tag ), :status => :created }
    end
  end

  def update
    flash_notice = ''

    @tag = current_user.tags.where( "id = ?", params[:id] ).first

    tag_name = params[ :tag ][ :name ]
    color_class = params[ :tag ][ :color_class ]
    unless tag_name.nil? or color_class.nil?
      @tag.name = tag_name
      @tag.color_class = color_class
      flash_notice = 'Tag color has been updated.'
    end

    if @tag.save
      flash[:notice] = flash_notice
    end

    respond_to do |format|
      format.js { render :json => DefaultDto.new( :template => 'tags-tag',
        :data => @tag ) }
    end
  end

  def destroy
    @tag = current_user.tags.where( "id = ?", params[:id] ).first
    @tag.destroy
    respond_to do |format|
      format.js { render :json => DefaultDto.new( :template => '', :data => @tag ) }
    end
  end


end
